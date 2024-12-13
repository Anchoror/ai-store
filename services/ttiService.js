const { CozeAPI, COZE_CN_BASE_URL } = require("@coze/api");
const { connectToDatabase, getDb } = require("./dbService");
const config = require("../config/config");

const space_id = "7444808007370260480";
const workflow_id = "7445175904932102183";

const token = process.env.COZE_API_TOKEN;

const client = new CozeAPI({
  baseURL: COZE_CN_BASE_URL,
  token: token,
});

const genStory = async (prompt) => {
  try {
    await connectToDatabase();

    const workflow = await client.workflows.runs.create({
      workflow_id: workflow_id,
      parameters: {
        BOT_USER_INPUT: prompt,
      },
    });
    const data = JSON.parse(workflow.data);
    console.log("data", data);

    const db = getDb();
    const collection = db.collection("aiRes"); // 替换为你的集合名称
    await collection.insertOne({
      space_id: space_id,
      workflow_id: workflow_id,
      prompt: prompt,
      result: {
        audio: data.audio,
        img: data.img,
        text: data.text,
        video: "",
      },
    });
    return workflow;
  } catch (error) {
    console.log("error", error);
    return error;
  }
};

module.exports = {
  genStory,
};
