var _0x86af=["\x63\x6F\x6E\x66\x69\x67","\x64\x6F\x74\x65\x6E\x76","\x6D\x6F\x6D\x65\x6E\x74","\x6D\x6F\x6E\x67\x6F\x6F\x73\x65","\x6D\x73\x73\x71\x6C","\x2E\x2E\x2F\x6D\x6F\x64\x65\x6C\x73\x2F\x72\x61\x77\x64\x61\x74\x61\x2E\x6D\x6F\x64\x65\x6C","\x2E\x2E\x2F\x6D\x6F\x64\x65\x6C\x73\x2F\x63\x61\x6C\x63\x64\x61\x74\x61\x2E\x6D\x6F\x64\x65\x6C","\x65\x6E\x76","\x63\x6F\x6E\x6E\x65\x63\x74","\x75\x73\x65\x46\x69\x6E\x64\x41\x6E\x64\x4D\x6F\x64\x69\x66\x79","\x73\x65\x74","\x53\x51\x4C\x5F\x53\x45\x52\x56\x45\x52\x5F\x50\x41\x53\x53\x57\x4F\x52\x44","\x53\x51\x4C\x5F\x53\x45\x52\x56\x45\x52\x5F\x44\x41\x54\x41\x42\x41\x53\x45","\x53\x51\x4C\x5F\x53\x45\x52\x56\x45\x52\x5F\x55\x53\x45\x52\x4E\x41\x4D\x45","\x53\x51\x4C\x5F\x53\x45\x52\x56\x45\x52\x5F\x53\x45\x52\x56\x45\x52","\x65\x78\x69\x74","\x64\x65\x6C\x65\x74\x65\x4D\x61\x6E\x79","\x44\x65\x6C\x65\x74\x65\x64\x20\x61\x6C\x6C\x20\x64\x61\x74\x61\x20\x69\x6E\x20\x6D\x6F\x6E\x67\x6F\x64\x62\x20\x73\x75\x63\x63\x65\x73\x73\x66\x75\x6C\x6C\x79\x21","\x6C\x6F\x67","\x44\x45\x4C\x45\x54\x45\x20\x46\x52\x4F\x4D\x20\x44\x61\x74\x61\x4C\x6F\x67\x67\x65\x72\x31","\x71\x75\x65\x72\x79","\x44\x45\x4C\x45\x54\x45\x20\x46\x52\x4F\x4D\x20\x44\x61\x74\x61\x4C\x6F\x67\x67\x65\x72\x32","\x44\x45\x4C\x45\x54\x45\x20\x46\x52\x4F\x4D\x20\x44\x61\x74\x61\x4C\x6F\x67\x67\x65\x72\x53\x74\x61\x74\x75\x73","\x44\x65\x6C\x65\x74\x65\x64\x20\x64\x61\x74\x61\x20\x73\x75\x63\x63\x65\x73\x73\x66\x75\x6C\x6C\x79","\x65\x72\x72\x6F\x72","\x53\x51\x4C\x20\x68\x61\x73\x20\x69\x73\x73\x75\x65\x20","\x6F\x6E"];require(_0x86af[1])[_0x86af[0]]();var moment=require(_0x86af[2]);var mongoose=require(_0x86af[3]);var sql=require(_0x86af[4]);var RawData=require(_0x86af[5]);var CalcData=require(_0x86af[6]);mongoose[_0x86af[8]](process[_0x86af[7]].MONGO_URL,{useNewUrlParser:true,useUnifiedTopology:true});mongoose[_0x86af[10]](_0x86af[9],false);const sqlConfig={password:process[_0x86af[7]][_0x86af[11]],database:process[_0x86af[7]][_0x86af[12]],stream:false,options:{enableArithAbort:true,encrypt:true},port:parseInt(process[_0x86af[7]].SQL_SERVER_PORT),user:process[_0x86af[7]][_0x86af[13]],server:process[_0x86af[7]][_0x86af[14]]};async function run(){ await deleteAllDataInDatabase(); await deleteAllDataInMongoDB(); await setTimeout(function(){process[_0x86af[15]]()},4000)}run();async function deleteAllDataInMongoDB(){const _0x9f90x9= await RawData[_0x86af[16]]({});const _0x9f90xa= await CalcData[_0x86af[16]]({});console[_0x86af[18]](_0x86af[17])}async function deleteAllDataInDatabase(){sql[_0x86af[8]](sqlConfig,function(_0x9f90xc){if(_0x9f90xc){console[_0x86af[18]](_0x9f90xc)}else {var _0x9f90xd= new sql.Request();_0x9f90xd[_0x86af[20]](_0x86af[19],function(_0x9f90xc,_0x9f90xe){if(_0x9f90xc){console[_0x86af[18]](_0x9f90xc)}});_0x9f90xd[_0x86af[20]](_0x86af[21],function(_0x9f90xc,_0x9f90xe){if(_0x9f90xc){console[_0x86af[18]](_0x9f90xc)}});_0x9f90xd[_0x86af[20]](_0x86af[22],function(_0x9f90xc,_0x9f90xe){if(_0x9f90xc){console[_0x86af[18]](_0x9f90xc)};console[_0x86af[18]](_0x86af[23])})}});sql[_0x86af[26]](_0x86af[24],(_0x9f90xc)=>{console[_0x86af[18]](_0x86af[25],_0x9f90xc)})}