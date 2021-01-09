const validator = require('./validator')
const { check } = require('express-validator/check')
const path = require('path')

class teacherValidator extends validator {
  handle() {
    return [
      check('field')
        .not()
        .isEmpty()
        .withMessage('رشته تحصیلی خود را وارد کنید'),
      check('college').not().isEmpty().withMessage('دانشگاه خود را وارد کنید'),
      check('resume').custom(async (value) => {
        if (!value) throw new Error('وارد کردن رزومه الزامی است')
        let fileExt = ['.pdf', '.png', '.jpg']
        if (!fileExt.includes(path.extname(value)))
          throw new Error(
            'پسوند فایل وارد شده از پسوندهای استاندارد برای ارسال رزومه نیست .pdf, .png, .jpg'
          )
      }),
    ]
  }
}

module.exports = new teacherValidator()
