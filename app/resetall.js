require('dotenv').config()
var moment = require('moment');
var mongoose = require('mongoose');
var sql = require("mssql");

var RawData = require('../models/rawdata.model')
var CalcData = require('../models/calcdata.model')

mongoose.connect(process.env.MONGO_URL, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set('useFindAndModify', false); 

const sqlConfig = {
  password: process.env.SQL_SERVER_PASSWORD,
  database: process.env.SQL_SERVER_DATABASE,
  stream: false,
  options: {
    enableArithAbort: true,
    encrypt: true
  },
  port: parseInt(process.env.SQL_SERVER_PORT),
  user: process.env.SQL_SERVER_USERNAME,
  server: process.env.SQL_SERVER_SERVER,
  //driver:'tedious'
}

async function run(){  
  await deleteAllDataInDatabase()
  await deleteAllDataInMongoDB()
  await setTimeout(function(){
    process.exit()
  }, 4000);
  
}
run();

async function deleteAllDataInMongoDB(){
  const res = await RawData.deleteMany({});
  const res1 = await CalcData.deleteMany({});
  console.log('Deleted all data in mongodb successfully!')
}


async function deleteAllDataInDatabase(){
  // connect to your database
  sql.connect(sqlConfig, function (err) {
    if (err){
      console.log(err);
    } 
    else
    {
      var request = new sql.Request();
      request.query('DELETE FROM DataLogger1', function(err, recordsets) {  
        if (err) console.log(err); 
        //console.log(recordsets)
      });

      request.query('DELETE FROM DataLogger2', function(err, recordsets) {  
        if (err) console.log(err); 
        //console.log(recordsets)
      });

      request.query('DELETE FROM DataLoggerStatus', function(err, recordsets) {  
        if (err) console.log(err); 
        console.log('Deleted data successfully')
        
      });
   
    }
  })

  sql.on('error', err => {
    console.log('SQL has issue ', err )
  })
}
 






