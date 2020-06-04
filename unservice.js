var Service = require('node-windows').Service;
// Create a new service object
var svc = new Service({
  name:'AucontechGateway',
  script: require('path').join(__dirname,'index1.js')
});
 
// Listen for the "uninstall" event so we know when it's done.
svc.on('uninstall',function(){
  console.log('Uninstall completed.');
  console.log('The service exists: ',svc.exists);
});
 
// Uninstall the service.
svc.uninstall();
