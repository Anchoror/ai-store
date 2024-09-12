require("dotenv").config();
const Koa = require("koa");
const Router = require("koa-router");
const bodyParser = require("koa-bodyparser");
const views = require("koa-views");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const util = require("util");

// 将 exec 包装为 Promise
const execPromise = util.promisify(exec);

const app = new Koa();
const router = new Router();

app.use(bodyParser());

// 配置模板引擎（EJS）
app.use(views(path.join(__dirname, "views"), { extension: "ejs" }));

// 配置路由
router.get("/", async (ctx) => {
  await ctx.render("index", { title: "AI Store", apiKey: process.env.API_KEY });
});
router.post("/api/generate", async (ctx) => {
  const { prompt } = ctx.request.body;
  if (!prompt) {
    ctx.status = 400;
    ctx.body = { message: "Prompt is required" };
    return;
  }

  try {
    const command = `python py/tts_inference.py "${prompt}"`;

    console.log(`Executing command: ${command}`);

    const { stdout, stderr } = await execPromise(command);

    if (stderr) {
      console.error(`stderr: ${stderr}`);
      ctx.status = 500;
      ctx.body = { message: "TTS processing failed", data: stderr };
      return;
    }

    console.log(`stdout: ${stdout}`);

    // 读取生成的音频文件
    const audioPath = path.join(__dirname, "output.wav");

    // 检查音频文件是否存在
    if (!fs.existsSync(audioPath)) {
      ctx.status = 500;
      ctx.body = { message: "Audio file not generated" };
      return;
    }

    // 返回音频文件
    const audioData = fs.readFileSync(audioPath);
    ctx.set("Content-Type", "audio/wav");
    ctx.body = audioData;
  } catch (error) {
    console.error(`exec error: ${error}`);
    ctx.status = 500;
    ctx.body = { message: "TTS processing failed" };
  }
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(3003, () => {
  console.log("server is running at http://localhost:3003");
});
