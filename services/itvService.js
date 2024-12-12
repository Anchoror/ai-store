const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const path = require("path");
const { getDb, ObjectId } = require("./dbService");
const https = require("https");
const axios = require("axios");

const command = ffmpeg();

const downloadFile = async (url, dest) => {
  try {
    const response = await axios({
      method: "get",
      url: url,
      responseType: "stream", // 设置响应类型为流
    });

    const writer = fs.createWriteStream(dest);

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });
  } catch (error) {
    // fs.unlink(dest);
    console.error("下载图片时出错:", error.message);

    throw error;
  }
};

const createVideoFromImageAndAudio = (
  audioPath,
  imagePath,
  text,
  fontPath,
  outputPath
) => {
  const arr = text.split("");
  arr.splice(18, 0, "\n");
  const drawtext = arr.join("");
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(imagePath)
      .inputOptions("-loop", "1")
      .input(audioPath)
      .outputOptions(
        "-c:v",
        "libx264",
        "-preset",
        "fast",
        "-crf",
        "23",
        "-pix_fmt",
        "yuv420p",
        "-shortest"
      )
      .videoFilters([
        {
          filter: "drawtext",
          options: {
            text: drawtext,
            fontsize: 48,
            fontcolor: "white",
            x: "(w-text_w)/2", // 居中显示
            y: "(h-text_h)*0.88", // 居中显示
            box: 1,
            boxcolor: "black@0.5",
            boxborderw: 5,
            fontfile: fontPath,
          },
        },
      ])
      .output(outputPath)
      .on("end", () => {
        console.log("视频生成完成----", audioPath, imagePath, outputPath);
        resolve(outputPath);
      })
      .on("error", (err) => {
        console.error("视频生成出错:", err);
        reject(err);
      })
      .run();
  });
};

const mix = async (id) => {
  const db = await getDb();
  const data = await db.collection("aiRes").findOne({ _id: new ObjectId(id) });
  console.log("data", data);
  const { audio: audioArr, img: imgArr, text: textArr } = data.result;

  const tempDir = path.join(__dirname, "../static/temp");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  const tempVideoFiles = [];
  console.log("tempDir", tempDir, audioArr.length);

  for (let i = 0; i < audioArr.length; i++) {
    const audioPath = audioArr[i];
    const imgPath = imgArr[i];
    const text = textArr[i];

    const tempAudioPath = path.join(tempDir, `temp_audio_${i}.mp3`);
    const tempImgPath = path.join(tempDir, `temp_img_${i}.png`);
    const tempVideoPath = path.join(tempDir, `temp_video_${i}.mp4`);
    const fontPath = path.join(__dirname, "../static/font/font.otf");
    tempVideoFiles.push(tempVideoPath);

    // 下载远程文件到本地
    console.log("audioPath", audioPath, imgPath);
    await downloadFile(audioPath, tempAudioPath);
    await downloadFile(imgPath, tempImgPath);

    // // 创建临时视频
    createVideoFromImageAndAudio(
      tempAudioPath,
      tempImgPath,
      text,
      fontPath,
      tempVideoPath
    );
  }

  // 合并所有视频
  const concatFilePath = path.join(tempDir, "concat.txt");
  const outputStream = fs.createWriteStream(concatFilePath);
  tempVideoFiles.forEach((filePath) => {
    outputStream.write(`file '${filePath}'\n`);
  });

  outputStream.end();

  const outputPath = path.join(__dirname, "../static/itv/concat_video.mp4");

  return new Promise((resolve, reject) => {
    command
      .input(concatFilePath)
      .inputOptions(["-f", "concat", "-safe", "0"])
      .output(outputPath)
      .on("end", () => {
        console.log("最终视频合并完成");
        resolve(outputPath);
        // 清理临时文件
        // tempVideoFiles.forEach((filePath) => {
        //   fs.unlinkSync(filePath);
        // });
        // fs.unlinkSync(concatFilePath);
      })
      .on("error", (err) => {
        console.error("最终视频合并出错:", err);
        reject(err);
      })
      .run();
  });
};

module.exports = {
  mix,
};
