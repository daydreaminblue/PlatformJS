const autoBind = require('auto-bind')
const { validationResult } = require('express-validator/check')
const isMongoId = require('validator/lib/isMongoId')

module.exports = class controller {
  constructor() {
    autoBind(this)
  }

  async validationData(req) {
    const result = validationResult(req)
    
    if (!result.isEmpty()) {
      const errors = result.array()
      const messages = []

      errors.forEach((err) => messages.push(err.msg))
      req.flash('errors', messages)

      return false
    }

    return true
  }

  back(req, res) {
    req.flash('formData', req.body)
    return res.redirect(req.header('Referer') || '/')
  }

  isMongoId(paramId) {
    if (!isMongoId(paramId)) this.error('ای دی وارد شده صحیح نیست', 404)
  }

  error(message, status = 500) {
    let err = new Error(message)
    err.status = status
    throw err
  }

  slug(title) {
    return title.replace(/([^۰-۹آ-یa-z0-9]|-)+/g, '-')
  }

  alert(req, data) {
    let title = data.title || '',
      message = data.message || '',
      type = data.type || 'info',
      button = data.button || null,
      timer = data.timer || 2000

    req.flash('sweetalert', { title, message, type, button, timer })
  }

  alertAndBack(req, res, data) {
    this.alert(req, data)
    this.back(req, res)
  }

  getUrlVideo(video) {
    return `${video.destination}/${video.filename}`.substring(8)
  }
}
