from transformers import pipeline
import sys
import os
import soundfile as sf


os.environ["HF_HUB_ENABLE_SYMLINKS"] = "false"
def text_to_speech(text):
    # 加载 hugging face TTS 模型
    tts_pipeline = pipeline("text-to-speech", model="suno/bark-small")

    # 进行推理，生成语音
    audio = tts_pipeline(text)
    

    # 获取音频数据和采样率
    audio_data = audio['audio'].flatten()
    sampling_rate = audio['sampling_rate']

    # 保存为 WAV 文件
    sf.write('output.wav', audio_data, sampling_rate)



if __name__ == "__main__":
    text = sys.argv[1]  # 从命令行参数获取输入文本
    print("输入文本：", text)
    text_to_speech(text)
    print("语音生成完成！")