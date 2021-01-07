const multer = require('multer')
const mkdirp = require('mkdirp')
const fs = require('fs')

const getDirResume = () => {
  let year = new Date().getFullYear()
  let month = new Date().getMonth() + 1
  let day = new Date().getDay()

  return `./public/uploads/resumes/${year}/${month}/${day}`
}

const ResumeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dir = getDirResume()

    mkdirp(dir, (err) => cb(null, dir))
  },
  filename: (req, file, cb) => {
    let filePath = getDirResume() + '/' + file.originalname
    if (!fs.existsSync(filePath)) cb(null, file.originalname)
    else cb(null, Date.now() + '-' + file.originalname)
  },
})

const uploadResume = multer({
  storage: ResumeStorage,
  limits: {
    fileSize: 1024 * 1024 * 10,
  },
})

module.exports = uploadResume
