"use strict";
const  { 
  OPCUAClient ,
  resolveNodeId, 
  AttributeIds,
  ClientMonitoredItemGroup, 
  TimestampsToReturn
 } = require("node-opcua-client");

const endpointUri = "opc.tcp://192.168.75.170:4840";

(async () => {

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
        });

        client.on("connection_reestablished", () => {
            console.log("Connection re-established");
        });

        client.on("connection_failed", () => {
            console.log("Connection failed");
        });
        client.on("start_reconnection", () => {
            console.log("Starting reconnection");
        });

        client.on("after_reconnection", (err) => {
            console.log("After Reconnection event =>", err);
        });

        await client.connect(endpointUri);

        const session = await client.createSession();

        const subscription = await session.createSubscription2({
            maxNotificationsPerPublish: 1000,
            publishingEnabled: true,
            requestedLifetimeCount: 100,
            requestedMaxKeepAliveCount: 10,
            requestedPublishingInterval: 1000
        });

        subscription.on("started", (n) => {
            //console.log(n.toString());
        });

        const itemsToMonitor = [
            {
                attributeId: AttributeIds.Value,
                nodeId: resolveNodeId("ns=3;s=Temperature")
            },

            {
                attributeId: AttributeIds.Value,
                nodeId: resolveNodeId("ns=3;s=Flow")
            },
            {
                attributeId: AttributeIds.Value,
                nodeId: resolveNodeId("ns=3;s=CompensatedFlow")
            },
          /*  {
                attributeId: AttributeIds.Value,
                nodeId: resolveNodeId("ns=3;s=AirConditioner_4.Temperature")
            },
           {
                attributeId: AttributeIds.Value,
                nodeId: resolveNodeId("ns=3;s=AirConditioner_5.Temperature")
            }*/
 
        ];

        const optionsGroup = {
            discardOldest: true,
            queueSize: 1,
            samplingInterval: 10
        };
        const monitoredItemGroup = ClientMonitoredItemGroup.create(subscription, itemsToMonitor, optionsGroup, TimestampsToReturn.Both);

        //subscription.on("item_added",function(monitoredItem){
        monitoredItemGroup.on("initialized",  () => {
            console.log(" Initialized !");
        });

        monitoredItemGroup.on("changed",  (monitoredItem, dataValue, index) => {
            console.log("Changed on ",index, dataValue.value.value);
            //,  dataValue.value);
            //console.log("Data",index,dataValue.value.value);
        });

        await new Promise((resolve) => setTimeout(resolve, 1000000));

        await monitoredItemGroup.terminate();

        await session.close();
        await client.disconnect();
        console.log("Done !");

    } catch (err) {
        console.log("Error", err);
    }
})();