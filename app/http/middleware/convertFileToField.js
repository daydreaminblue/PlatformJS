const User = require('app/models/user')
const middleware = require('./middleware')

class convertFileToField extends middleware {
  handleImages(req, res, next) {
    if (!req.file) req.body.images = undefined
    else req.body.images = req.file.filename

    next()
  }

  handleVideo(req, res, next) {
    if (!req.file) req.body.video = undefined
    else req.body.video = req.file.filename

    next()
  }

  handleResume(req, res, next) {
    if (!req.file) req.body.resume = undefined
    else req.body.resume = req.file.filename

    next()
  }
}

module.exports = new convertFileToField()
