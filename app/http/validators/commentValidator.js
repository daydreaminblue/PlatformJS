const validator = require('./validator')
const { check } = require('express-validator/check')
const Course = require('app/models/course')
const path = require('path')

class commentValidator extends validator {
  handle() {
    return [
      check('comment')
        .isLength({ min: 10 })
        .withMessage('متن نظر نمیتواند کمتر از 10 کاراکتر باشد'),
    ]
  }
}

module.exports = new commentValidator()
