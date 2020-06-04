require('dotenv').config()


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

module.exports = sqlConfig;