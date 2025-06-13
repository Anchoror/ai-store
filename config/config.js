module.exports = {
  // coze SDK
  appId: process.env.APP_ID,
  apiKey: process.env.API_KEY,
  apiSecret: process.env.API_SECRET,

  // 数据库db
  mongodbName: "aiStores",
  mongodbUri: "mongodb://localhost:27017",

  // 数据库mysql

  host: "localhost",
  user: "root",
  password: "root",
  database: "baseNmae",
  port: 3306,
};
