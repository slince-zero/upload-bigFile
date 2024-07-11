import express from 'express'
import cors from 'cors' // 解决跨域
import multer from 'multer' // 上传文件
import fs from 'fs'
import path from 'path'

// 初始化 multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'upload'
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir)
    }
    cb(null, uploadDir) // 每个切片存放的目录
  },
  filename(req, file, cb) {
    cb(null, `${req.body.index}-${req.body.filename}`)
  },
})

const upload = multer({ storage })

const app = express()

app.use(cors()) // 解决跨域
app.use(express.json()) // 解析 json

app.post('/upload', upload.single('file'), (req, res) => {
  res.send('ok')
})

app.post('/merge', (req, res) => {
  // 读取所有切片
  const uploadDir = path.join(process.cwd(), 'upload')
  const files = fs.readdirSync(uploadDir)
  // 排序
  files.sort((a, b) => a.split('-'[0] - b.split('-')[0]))

  // 合并切片
  const videoDir = path.join(process.cwd(), 'video')
  if (!fs.existsSync(videoDir)) {
    fs.mkdirSync(videoDir)
  }
  const video = path.join(videoDir, `${req.body.filename}.mp4`)
  files.forEach((file) => {
    fs.appendFileSync(video, fs.readFileSync(path.join(uploadDir, file)))
    fs.unlinkSync(path.join(uploadDir, file))
  })
  res.send('OK')
})

app.listen(3002, () => {
  console.log('http://localhost:3002')
})
