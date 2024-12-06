require("dotenv").config({
  path: [".env.local", ".env"],
});
const Koa = require("koa");
const Router = require("koa-router");
const bodyParser = require("koa-bodyparser");
const views = require("koa-views");
const crypto = require("crypto");
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

const host = "https://spark-api.cn-huabei-1.xf-yun.com";
const date = new Date().toUTCString();
const post_url = "/v2.1/tti";

const auth_str = `host: ${host}\ndate: ${date}\nPOST ${post_url} HTTP/1.1`;

const tmp_sha = crypto
  .createHmac("sha256", process.env.API_SECRET)
  .update(auth_str)
  .digest();
const signature = Buffer.from(tmp_sha).toString("base64");
const authorization_origin = `api_key="${process.env.API_KEY}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
const authorization = Buffer.from(authorization_origin).toString("base64");

const url = new URL(post_url, host);
url.searchParams.append("authorization", authorization);
url.searchParams.append("date", date);
url.searchParams.append("host", host);

// 向服务器发送请求
const data = {
  header: {
    app_id: process.env.APP_ID,
  },
  parameter: {
    chat: {
      domain: "general",
      width: 512,
      height: 512,
    },
  },
  payload: {
    message: {
      text: [
        {
          role: "user",
          content:
            "火柴燃起来了，发出亮光来了。亮光落在墙上，那儿忽然变得像薄纱那么透明，她可以一直看到屋里。桌上铺着雪白的台布，摆着精致的盘子和碗，肚子里填满了苹果和梅子的烤鹅正冒着香气。",
        },
      ],
    },
  },
};
const options = {
  method: "POST",
  headers: {
    "Content-Type": "application/json;charset=UTF-8",
    Authorization: authorization,
  },

  body: JSON.stringify(data),
};
fetch(url.toString(), options).then((res) => {
  res.json().then((data) => {
    console.log("data", data.payload.choices.text);
    const base64 = data.payload.choices.text[0].content;
    // const base64 = imgRes.replace(/^data:image\/\w+;base64,/, "");
    const time = Date.now();
    fs.writeFileSync(`./static/ai/ai_img_${time}.png`, base64, "base64");

    const app = new Koa();
    const router = new Router();

    app.use(bodyParser());

    // 配置模板引擎（EJS）
    app.use(views(path.join(__dirname, "views"), { extension: "ejs" }));

    // 配置路由
    router.get("/", async (ctx) => {
      await ctx.render("index", {
        title: "AI Store",
        img: "data:image/png;base64," + base64,
      });
    });

    app.use(router.routes()).use(router.allowedMethods());

    app.listen(3004, () => {
      console.log("server is running at http://localhost:3004");
    });
  });
});
