const multer = require('multer')
const mkdirp = require('mkdirp')
const fs = require('fs')

const getDirVideo = () => {
  let year = new Date().getFullYear()
  let month = new Date().getMonth() + 1
  let day = new Date().getDay()

  return `./public/uploads/videos/${year}/${month}/${day}`
}

const VideoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dir = getDirVideo()

    mkdirp(dir, (err) => cb(null, dir))
  },
  filename: (req, file, cb) => {
    let filePath = getDirVideo() + '/' + file.originalname
    if (!fs.existsSync(filePath)) cb(null, file.originalname)
    else cb(null, Date.now() + '-' + file.originalname)
  },
})

const uploadVideo = multer({
  storage: VideoStorage,
})

module.exports = uploadVideo
