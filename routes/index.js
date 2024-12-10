const Router = require("koa-router");
const ttiController = require("../controllers/ttiController");

const router = new Router();

router.get("/", ttiController.index);

router.post("/api/story/gen", ttiController.gen);
router.post("/api/story/list", ttiController.list);
router.post("/api/story/mix", ttiController.mix);

module.exports = router;
