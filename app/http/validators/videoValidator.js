const validator = require('./validator')
const { check } = require('express-validator/check')
const path = require('path')

class videoValidator extends validator {
  handle() {
    return [
      check('video').custom(async (value, { req }) => {
        if (req.query._method === 'put' && value === undefined) return

        if (!value) throw new Error('وارد کردن ویدیو الزامی است')

        let fileExt = ['.mp4', '.mkv']
        if (!fileExt.includes(path.extname(value)))
          throw new Error(
            'پسوند فایل وارد شده از پسوندهای استاندارد ویدیو نیست'
          )
      }),
    ]
  }
}

module.exports = new videoValidator()
