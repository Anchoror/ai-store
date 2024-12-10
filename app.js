require("dotenv").config({
  path: [".env.local", ".env"],
});
const Koa = require("koa");
const bodyParser = require("koa-bodyparser");
const views = require("koa-views");
const path = require("path");
const router = require("./routes");

const app = new Koa();

app.use(bodyParser());
app.use(views(path.join(__dirname, "views"), { extension: "ejs" }));
app.use(router.routes()).use(router.allowedMethods());

app.listen(3004, () => {
  console.log("server is running at http://localhost:3004");
});
