const controller = require('./controller')
const passport = require('passport')

class registerController extends controller {
  showRegsitrationForm(req, res) {
    const title = 'صفحه عضویت'
    res.render('home/auth/register', { title })
  }

  register(req, res, next) {
    passport.authenticate('local.register', {
      successRedirect: '/',
      failureRedirect: '/auth/register',
      failureFlash: true,
    })(req, res, next)
  }
}

module.exports = new registerController()
