const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const path = require("path");
const { getDb, ObjectId } = require("./dbService");

const command = ffmpeg();

const mix = async (id) => {
  const db = await getDb();
  const data = await db
    .collection("aiRes")
    .findOne({ _id: new ObjectId("6757f17fbc49e31fdc944a7d") });
  console.log("data", id, data);
  const { audio: audioArr, img: imgArr, text: textArr } = data.result;

  const tempDir = path.join(__dirname, "../static/temp");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  const tempVideoFiles = [];

  for (let i = 0; i < audioArr.length; i++) {
    const audioPath = audioArr[i];
    const imgPath = imgArr[i];
    const text = textArr[i];

    const tempVideoPath = path.join(tempDir, `temp_video_${i}.mp4`);
    tempVideoFiles.push(tempVideoPath);

    // 创建临时视频
    command
      .input(imgPath)
      .input(audioPath)
      .inputOptions([
        "-loop",
        "1", // 循环播放图片

        "-shortest", // 以最短的输入为准
      ])
      .outputOptions([
        "-c:v",
        "libx264",
        "-preset",
        "fast",
        "-crf",
        "23",
        "-pix_fmt",
        "yuv420p",
      ])
      .output(tempVideoPath)
      .on("end", () => {
        console.log(`临时视频${i}生成完毕`);
      })
      .on("error", (err) => {
        console.error(`临时视频${i}生成出错:`, err);
      })
      .run();
  }

  // 合并所有视频
  const concatFilePath = path.join(tempDir, "concat.txt");
  const outputStream = fs.createWriteStream(concatFilePath);
  tempVideoFiles.forEach((filePath) => {
    outputStream.write(`file '${filePath}'\n`);
  });

  outputStream.end();

  const outputPath = path.join(__dirname, "../static/itv/output.mp4");
  command
    .input(concatFilePath)
    .inputOptions(["-f", "concat", "-safe", "0"])
    .output(outputPath)
    .on("end", () => {
      console.log("最终视频合并完成");
      // 清理临时文件
      tempVideoFiles.forEach((filePath) => {
        fs.unlinkSync(filePath);
      });
      fs.unlinkSync(concatFilePath);
    })
    .on("error", (err) => {
      console.error("最终视频合并出错:", err);
    })
    .run();

  return outputPath;
};

module.exports = {
  mix,
};
