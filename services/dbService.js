// db.js
const { MongoClient, ObjectId } = require("mongodb");
const config = require("../config/config");

const uri = config.mongodbUri;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let db;

async function connectToDatabase() {
  if (db) return db;

  try {
    await client.connect();
    db = client.db(config.mongodbName); // 替换为你的数据库名称
    console.log("Connected to the database");
    return db;
  } catch (error) {
    console.error("Error connecting to the database:", error);
    throw error;
  }
}

function getDb() {
  if (!db) {
    throw new Error("Database connection not established");
  }
  return db;
}

function closeConnection() {
  client.close();
}

module.exports = { connectToDatabase, getDb, ObjectId };
