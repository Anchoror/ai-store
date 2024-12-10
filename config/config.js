module.exports = {
  host: "https://spark-api.cn-huabei-1.xf-yun.com",
  postUrl: "/v2.1/tti",
  appId: process.env.APP_ID,
  apiKey: process.env.API_KEY,
  apiSecret: process.env.API_SECRET,

  // 数据库
  mongodbName: "aiStores",
  mongodbUri: "mongodb://localhost:27017",
};
