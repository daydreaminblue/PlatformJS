const controller = require('./controller')
const passport = require('passport')

class loginController extends controller {
  showLoginForm(req, res) {
    const title = 'صفحه ورود'
    res.render('home/auth/login', { title })
  }

  login(req, res, next) {
    passport.authenticate('local.login', (err, user) => {
      if (!user) return res.redirect('/auth/login')

      req.logIn(user, (err) => {
        if (req.body.remember) {
          user.setRememberToken(res)
        }

        return res.redirect('/')
      })
    })(req, res, next)
  }
}

module.exports = new loginController()
