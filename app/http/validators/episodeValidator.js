const validator = require('./validator')
const { check } = require('express-validator/check')

class episodeValidator extends validator {
  handle() {
    return [
      check('title')
        .isLength({ min: 5 })
        .withMessage('عنوان نمیتواند کمتر از 5 کاراکتر باشد'),

      check('course')
        .not()
        .isEmpty()
        .withMessage('فیلد دوره مربوطه نمیتواند خالی بماند'),

      check('video').custom(async (value, { req }) => {
        if (req.query._method === 'put' && value === undefined) return
        if (!value) throw new Error('وارد کردن ویدیو الزامی است')
      }),

      check('body')
        .isLength({ min: 20 })
        .withMessage('متن دوره نمیتواند کمتر از 20 کاراکتر باشد'),
    ]
  }

  slug(title) {
    return title.replace(/([^۰-۹آ-یa-z0-9]|-)+/g, '-')
  }
}

module.exports = new episodeValidator()
