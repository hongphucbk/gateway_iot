var Service = require('node-windows').Service;
var EventLogger = require('node-windows').EventLogger;
 
var log = new EventLogger('Aucontech-Gateway');

// Create a new service object
var svc = new Service({
  name:'AucontechGateway',
  description: 'The gateway read data from Flexy by Aucontech',
  //script: 'E:\\Aucontech\\02. Project\\02. Linde Malaysia\\Project\\GatewayIOT_Demo\\index1.js',
  script: require('path').join(__dirname,'index1.js')
});
 
// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install',function(){
  svc.start();
  log.info('This service is running successfully');
});
 
svc.install();

 
