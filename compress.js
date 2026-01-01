#!/usr/bin/env node

(async () => {
  const { spawn } = require("child_process")
  const fs = require("fs")
  const os = require("os")
  const path = require("path")
  const figlet = require("figlet")
  const ProgressBar = require("progress")

  function randomString(length = 8) {
    return Math.random().toString(36).substring(2, 2 + length)
  }

  async function getDuration(input) {
    return new Promise((resolve, reject) => {
      const ffprobe = spawn("ffprobe", [
        "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        input
      ])
      let output = ""
      ffprobe.stdout.on("data", (data) => (output += data.toString()))
      ffprobe.on("close", () => {
        const dur = parseFloat(output.trim())
        if (isNaN(dur)) reject("could not determine video duration")
        else resolve(dur)
      })
    })
  }

  async function runFfmpeg(input, output, bitrate, durationSeconds) {
    return new Promise((resolve, reject) => {
      const ffmpeg = spawn("ffmpeg", [
        "-i", input,
        "-c:v", "libx264",
        "-b:v", String(Math.floor(bitrate)) + "k",
        "-preset", "medium",
        "-c:a", "aac",
        "-b:a", "64k",
        output
      ])

      const bar = new ProgressBar("compressing your video - [:bar] :percent :etas", {
        complete: "=",
        incomplete: " ",
        width: 40,
        total: durationSeconds
      })

      ffmpeg.stderr.on("data", (data) => {
        const str = data.toString()
        const timeMatch = str.match(/time=(\d+):(\d+):(\d+\.\d+)/)
        if (timeMatch) {
          const hours = parseInt(timeMatch[1], 10)
          const minutes = parseInt(timeMatch[2], 10)
          const seconds = parseFloat(timeMatch[3])
          const currentSeconds = hours * 3600 + minutes * 60 + seconds
          bar.update(currentSeconds / durationSeconds)
        }
      })

      ffmpeg.on("close", (code) => {
        if (code === 0) {
          const stats = fs.statSync(output)
          const sizeMB = stats.size / (1024 * 1024)
          resolve(sizeMB)
        } else {
          reject("ffmpeg failed")
        }
      })
    })
  }

  async function compressToTarget(input) {
    const downloadsDir = path.join(os.homedir(), "downloads")
    const output = path.join(downloadsDir, `compresseight-${randomString()}.mp4`)
    const durationSeconds = await getDuration(input)

    const bits = 8 * 1024 * 1024 * 8
    const bitrate = bits / durationSeconds / 1000
    const sizeMB = await runFfmpeg(input, output, bitrate, durationSeconds)

    console.log("\n")
    console.log(`compressed! saved to: ${output}`)
    console.log(`compressed size: ${sizeMB.toFixed(2)} mb`)
    if (sizeMB > 8) {
      console.warn("warning: your video may be a little bit over 8mb")
    }
  }

  const args = process.argv.slice(2)
  if (args.length < 1) {
    console.log("usage: compresseight <input.mp4>")
    process.exit(1)
  }

  const [input] = args

  figlet("compress8", async (err, data) => {
    if (err) {
      console.log("something went wrong")
      console.dir(err)
      return
    }
    console.log(data)
    console.log("\n")
    await compressToTarget(input)
  })
})()
