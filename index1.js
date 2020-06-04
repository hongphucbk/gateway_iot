require('dotenv').config()
var moment = require('moment');
var mongoose = require('mongoose');
var sql = require("mssql");

var RawData = require('./models/rawdata.model')
var CalcData = require('./models/calcdata.model')

mongoose.connect(process.env.MONGO_URL, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set('useFindAndModify', false); 

const sqlConfig = require('./config/sql.js')

const  { 
  OPCUAClient,
  resolveNodeId, 
  AttributeIds,
  ClientMonitoredItemGroup, 
  TimestampsToReturn
 } = require("node-opcua-client");

let TIER_2_BENCHMARK = parseFloat(process.env.TIER_2_BENCHMARK)
let TIME_INTERVAL_GETDATA = parseInt(process.env.TIME_INTERVAL_GETDATA) * 1000;
let TIME_INTERVAL_CALCDATA = parseInt(process.env.TIME_INTERVAL_CALCDATA) * 1000;
let TIME_INTERVAL_REMOVE_DATA = parseInt(process.env.TIME_INTERVAL_REMOVE_DATA) * 86400000;
let flexy_ns = process.env.FLEXY_Namespace;

var opc_server = [];
var opc_server_avr = [];
var interval_flag = 0;

async function run(){
  await readFirstConfig()
    
  await setTimeout(function(){}, 2000);
  await setInterval(async function(){
    //console.log(opc_server[0].data[4].value)

    if (interval_flag) {
      let FlowCon = opc_server[0].data[3].value
      let preTier1 = opc_server[0].tier1
      let preTier2 = opc_server[0].tier2

      let tier1, tier2
      if (FlowCon > TIER_2_BENCHMARK) {
        tier1 = TIER_2_BENCHMARK/60 + preTier1
        tier2 = (FlowCon - TIER_2_BENCHMARK)/60 + preTier2
      }else{
        tier1 = FlowCon/60 + preTier1
        tier2 = 0 + preTier2
      }

      //console.log('a', typeof(tier1))
      opc_server[0].tier1 = tier1
      opc_server[0].tier2 = tier2

      //console.log(FlowCon, TIER_2_BENCHMARK, tier1)

      let _site_id = opc_server[0].site_id
      let _site_name = opc_server[0].site_name

      insert_data(_site_id, _site_name, opc_server[0].data[0].value, opc_server[0].data[2].value, opc_server[0].data[1].value, opc_server[0].data[3].value, JSON.stringify(opc_server[0].data), tier1, tier2, opc_server[0].created_at);
      
      //console.log('daa ',opc_server[0].data[4].value) 
      let tempData = {
        site_id: opc_server[0].site_id,
        site_name: opc_server[0].site_name,
        information: opc_server[0].data,
        tier1: opc_server[0].tier1,
        tier2: opc_server[0].tier2,
        created_at: new Date(),
      }

      await RawData.insertMany(tempData, function(error, docs) {
        if (error) {
          console.log('Error save data to Local data')
        }
        //opc_server[0].data[4].value = 0
      });
    } //End if
  }, TIME_INTERVAL_GETDATA);

  //Calc average 
  await setInterval(async function(){
    //console.log(opc_server[0].data[4].value)

    if (interval_flag) {
    let startdate  = moment().subtract(15, 'minutes');
    //let startdate = new Date(enddate.getFullYear(), enddate.getMonth(), enddate.getDate(), enddate.getHours(),enddate.getMinutes(), 0 )
    let enddate = moment();
    
    let findCondition = { created_at: { $gte: startdate, $lte: enddate }, tier1: {$gt : 0} }
    let results = await RawData.find(findCondition);
    let recordsTotal  = await RawData.countDocuments(findCondition);
    let sum = 0;
    results.forEach(function(result){
      sum = sum + parseFloat(result.information[3].value)
    })

    let avrFlowCon = 0;
    if(recordsTotal > 0){
      avrFlowCon = sum/recordsTotal;
    }

    let avrPreTier1 = opc_server_avr.tier1
    let avrPreTier2 = opc_server_avr.tier2

    let avr_tier1, avr_tier2
    if (avrFlowCon > TIER_2_BENCHMARK) {
      avr_tier1 = TIER_2_BENCHMARK/60 + avrPreTier1
      avr_tier2 = (avrFlowCon - TIER_2_BENCHMARK)/60 + avrPreTier2
    }else{
      avr_tier1 = avrFlowCon/60 + avrPreTier1
      avr_tier2 = 0 + avrPreTier2
    }

    opc_server_avr.tier1 = avr_tier1
    opc_server_avr.tier2 = avr_tier2
    opc_server_avr.created_at = new Date()
    opc_server_avr.avrFlow = avrFlowCon;
    //console.log('Hello, Im Phuc ', opc_server_avr)

    let temp_data_save = opc_server_avr;
    temp_data_save.avr_flow = opc_server_avr.avrFlow

    CalcData.insertMany(temp_data_save, function(error, docs) {
      if (error) {
        console.log('Error save data to Local data')
      }
    });
    saveAvrDataToDatabase(opc_server[0].site_id, opc_server[0].site_name, opc_server_avr.avrFlow, opc_server_avr.tier1, opc_server_avr.tier2)
    } //End if
  }, TIME_INTERVAL_CALCDATA);

  //Delete data after 10 days 
  await setInterval(async function(){
    let before10days = moment().subtract(10, 'days');
    const res = await RawData.deleteMany({ created_at: { $lte: before10days } });
    console.log('Deleted data before ', before10days,'Total record deleted = ', res.deletedCount )

    deleteDataAfter10days()
  }, TIME_INTERVAL_REMOVE_DATA);

  //Check status
  await setInterval(async function(){
    saveConnectionStatusToDatabase(opc_server[0].site_id, opc_server[0].site_name, opc_server[0].data[4].value)
  }, TIME_INTERVAL_GETDATA);

  await readOPCUA1()
}

run(); 

async function readFirstConfig(){
  let arrTempTag = []
  let site_tags = [
                  process.env.FLEXY_Tagname1,
                  process.env.FLEXY_Tagname2,
                  process.env.FLEXY_Tagname3,
                  process.env.FLEXY_Tagname4,
                  process.env.FLEXY_Tagname5,
                ];

  for (const tag of site_tags) {
    arrTempTag.push({name: tag, value: 0, time: moment().local().format() })
  }

  let infor = {
    id: 1,
    site_id : process.env.site_id,
    site_name: process.env.site_name,
    ip: process.env.ip,
    port: parseInt(process.env.port),
    username: process.env.OPC_SERVER_USERNAME,
    password: process.env.OPC_SERVER_PASSWORD,
    data: arrTempTag,
    tier1: 0, 
    tier2: 0,
    created_at: new Date()
  }
  
  //console.log(site_tags, opc_server)
  opc_server_avr = {
    avrFlow: 0,
    tier1: 0, 
    tier2: 0
  }

  let lastRecord1m = await RawData.findOne().sort({ _id: -1 }).limit(1)
  if (lastRecord1m) {
    infor.tier1 = lastRecord1m.tier1
    infor.tier2 = lastRecord1m.tier2
  } else {
    infor.tier1 = parseFloat(process.env.START_TIER_1)
    infor.tier2 = parseFloat(process.env.START_TIER_2)
  }

  let lastRecord = await CalcData.findOne().sort({ _id: -1 }).limit(1)
  if (lastRecord) {
    opc_server_avr.tier1 = lastRecord.tier1
    opc_server_avr.tier2 = lastRecord.tier2
  } else {
    opc_server_avr.tier1 = parseFloat(process.env.START_AVR_TIER_1)
    opc_server_avr.tier2 = parseFloat(process.env.START_AVR_TIER_2)
  }

  opc_server.push(infor)
  console.log('*******************************************')
  console.log('First initialize ', opc_server, opc_server_avr)
  return;
}

function insert_data(site_id, site_name, temperature, pressure, flow, compensatedflow, information, tier1, tier2, created_at){
  // connect to your database
  sql.connect(sqlConfig, function (err) {
    if (err){
      console.log(err);
    } 
    else
    {
      var request = new sql.Request();

      request.input('site_id', sql.VarChar, site_id);
      request.input('site_name', sql.VarChar, site_name);
      request.input('information', sql.VarChar, information);
      request.input('created_at', sql.DateTimeOffset, created_at);
      request.input('temperature', sql.Decimal(10,2), parseFloat(temperature + 0.0) );
      request.input('pressure', sql.Decimal(10,2), parseFloat(pressure + 0.0) );
      request.input('flow', sql.Decimal(10,2), parseFloat(flow + 0.0) );
      request.input('compensatedflow', sql.Decimal(10,2), parseFloat(compensatedflow + 0.0) );
      request.input('tier1', sql.Decimal(10,2), parseFloat(tier1) );
      request.input('tier2', sql.Decimal(10,2), parseFloat(tier2) );

      
      let strQuery = 'INSERT INTO DataLogger1 (site_id, site_name, temperature, pressure, flow, compensatedflow,'
                   + ' information, created_at, tier1, tier2) VALUES ' 
                   + ' (@site_id,@site_name, @temperature,@pressure, @flow, @compensatedflow, @information, @created_at, @tier1, @tier2)'

      //console.log('a = ',temperature, pressure, flow, compensatedflow, strQuery) 
      request.query( strQuery , function(err, recordsets) {  
        if (err) console.log(err); 
        //console.log(recordsets)
        //sql.close()
      });
   
    }
  })
}

function saveAvrDataToDatabase(site_id, site_name, avrFlow, tier1, tier2){
  // connect to your database
  sql.connect(sqlConfig, function (err) {
    if (err){
      console.log(err);
    } 
    else
    {
      var request = new sql.Request();
      request.input('site_id', sql.VarChar, site_id);
      request.input('site_name', sql.VarChar, site_name);
      request.input('avrFlow', sql.Decimal(10,2), parseFloat(avrFlow));
      request.input('tier1', sql.Decimal(10,2), parseFloat(tier1) );
      request.input('tier2', sql.Decimal(10,2), parseFloat(tier2) );
      request.input('created_at', sql.DateTimeOffset, new Date());

      request.query('INSERT INTO DataLogger2 (site_id, site_name, avrflow, tier1, tier2, created_at) VALUES (@site_id,@site_name, @avrFlow, @tier1, @tier2, @created_at)', function(err, recordsets) {  
        if (err) console.log(err); 
        //console.log(recordsets)
        //sql.close()
      });
   
    }
  })
}

function saveConnectionStatusToDatabase(site_id, site_name, is_connect){
  // connect to your database
  sql.connect(sqlConfig, function (err) {
    if (err){
      console.log(err);
    } 
    else
    {
      var request = new sql.Request();
      request.input('site_id', sql.VarChar, site_id);
      request.input('site_name', sql.VarChar, site_name);
      request.input('is_connect', sql.Bit, is_connect );
      request.input('created_at', sql.DateTimeOffset, new Date());

      request.query('INSERT INTO DataLoggerStatus (site_id, site_name, is_connect, created_at) VALUES (@site_id,@site_name, @is_connect, @created_at)', function(err, recordsets) {  
        if (err) console.log(err); 
        //console.log(recordsets)
        //sql.close()
      });
   
    }
  })
}

function deleteDataAfter10days(){
  // connect to your database
  sql.connect(sqlConfig, function (err) {
    if (err){
      console.log(err);
    } 
    else
    {
      var request = new sql.Request();
      let before10days = moment().subtract(10, 'days');
      let beforeday = new Date(before10days)
      //console.log('data', beforeday)
      request.input('beforeday', sql.DateTimeOffset, beforeday);

      request.query('DELETE FROM DataLogger1 WHERE created_at < @beforeday', function(err, recordsets) {  
        if (err) console.log(err); 
        //console.log(recordsets)
      });

      request.query('DELETE FROM DataLogger2 WHERE created_at < @beforeday', function(err, recordsets) {  
        if (err) console.log(err); 
        //console.log(recordsets)
      });

      request.query('DELETE FROM DataLoggerStatus WHERE created_at < @beforeday', function(err, recordsets) {  
        if (err) console.log(err); 
        console.log('Deleted data before 10 days')
        
      });
   
    }
  })

  sql.on('error', err => {
    console.log('SQL has issue ', err )
  })

}
 
async function readOPCUA1(){
  try {
      const options = {
          endpoint_must_exist: false,
      };

      const client = OPCUAClient.create(options);

      client.on("backoff", (retry, delay) => {
          console.log("Backoff ", retry, " next attempt in ", delay, "ms");
      });

      client.on("connection_lost", () => {
          console.log("Connection lost");
          opc_server[0].data[4].value = 0
      });

      client.on("connection_reestablished", () => {
          console.log("Connection re-established");
          readOPCUA1();
      });

      client.on("connection_failed", () => {
          console.log("Connection failed");
          opc_server[0].data[4].value = 0
      });
      client.on("start_reconnection", () => {
          console.log("Starting reconnection");
          
      });

      client.on("after_reconnection", (err) => {
          console.log("After Reconnection event =>", err);
      });

      await client.connect(process.env.FLEXY_URL);

      const session = await client.createSession({userName: opc_server[0].username,password:opc_server[0].password});

      const subscription = await session.createSubscription2({
          maxNotificationsPerPublish: 5000,
          publishingEnabled: true,
          requestedLifetimeCount: 500,
          requestedMaxKeepAliveCount: 50,
          requestedPublishingInterval: 5000
      });

      subscription.on("started", (n) => {
          //console.log(n.toString());
      });

      // const itemsToMonitor = [
      //     {
      //         attributeId: AttributeIds.Value,
      //         nodeId: resolveNodeId("ns=1;s=Temperature")
      //     },

      // ];

      const itemsToMonitor = [];
      opc_server[0].data.forEach(function (ids) {
        let strNodeID = "ns=" + flexy_ns + ";s="+ids.name;
        let opc_temp = {
            attributeId: AttributeIds.Value,
            nodeId: resolveNodeId(strNodeID)
          }
        itemsToMonitor.push(opc_temp)
      })

      const optionsGroup = {
          discardOldest: true,
          queueSize: 1,
          samplingInterval: 10
      };
      const monitoredItemGroup = ClientMonitoredItemGroup.create(subscription, itemsToMonitor, optionsGroup, TimestampsToReturn.Both);

      //subscription.on("item_added",function(monitoredItem){
      monitoredItemGroup.on("initialized",  () => {
          console.log("OPC UA Initialized! Connect to Flexy successfully");
          opc_server[0].data[4].value = 1
      });

      monitoredItemGroup.on("changed",  (monitoredItem, dataValue, index) => {
        let item_name = monitoredItem.itemToMonitor.nodeId.value;
        //console.log("Changed on ", item_name, index, ' -- ', dataValue.value.value);
        //console.log("Data",index, (dataValue.serverTimestamp.toString() ) );
        //console.log("==================");
        let strTimestamp = dataValue.serverTimestamp.toString()
        //let dataDate = moment().local().format()
        //console.log('date = ', new Date(strTimestamp))

        var index1 = opc_server[0].data.findIndex(function(item, i){
          return item.name === item_name
        });
        opc_server[0].data[index1].value = parseFloat(dataValue.value.value.toFixed(2))
        opc_server[0].data[index1].time = new Date(strTimestamp);
        opc_server[0].created_at = new Date(strTimestamp);
        
        opc_server[0].data[4].value = 1
        interval_flag = 1
      });

      
      await new Promise((resolve) => setTimeout(resolve, 1000000000));

      await monitoredItemGroup.terminate();

      await session.close();
      await client.disconnect();
      console.log("Done !");
      readOPCUA1();
  } catch (err) {
      console.log("Error", err);
  }
};





