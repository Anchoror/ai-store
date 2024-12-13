const fs = require("fs");
const path = require("path");
const ttiService = require("../services/ttiService");
const dbService = require("../services/dbService");
const itvService = require("../services/itvService");
const { ObjectId } = require("mongodb");

const index = async (ctx) => {
  try {
    await ctx.render("index", {
      title: "AI Store",
    });
  } catch (error) {
    console.error(error);
    ctx.status = 500;
    ctx.body = { error: "Internal Server Error" };
  }
};

const gen = async (ctx) => {
  const { prompt } = ctx.request.body;
  const res = await ttiService.genStory(prompt);
  ctx.body = {
    data: res,
    code: 200,
  };
  ctx.status = 200;
};

const list = async (ctx) => {
  try {
    await dbService.connectToDatabase();
    const db = await dbService.getDb();
    const collection = db.collection("aiRes");
    const data = await collection.find().toArray();
    ctx.body = {
      data: data,
      code: 200,
    };
  } catch (error) {
    console.error(error);
    ctx.status = 500;
    ctx.body = { error: "Internal Server Error" };
  }
};

const mix = async (ctx) => {
  try {
    const { id } = ctx.request.body;
    const video = await itvService.mix(id);
    ctx.body = {
      data: video,
      code: 200,
    };
  } catch (error) {
    console.error(error);
    ctx.status = 500;
    ctx.body = { error: "Internal Server Error" };
  }
};

const del = async (ctx) => {
  try {
    const { id } = ctx.request.body;
    const db = await dbService.getDb();
    const collection = db.collection("aiRes");
    await collection.deleteOne({ _id: new ObjectId(id) });
    ctx.body = {
      data: "success",
      code: 200,
    };
  } catch (error) {
    console.error(error);
    ctx.status = 500;
  }
};

module.exports = {
  index,
  gen,
  list,
  mix,
  del,
};
