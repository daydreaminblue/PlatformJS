const controller = require('app/http/controllers/controller')

class userController extends controller {
  async index(req, res, next) {
    try {
      res.render('home/panel/index', { title: 'پنل کاربری' })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = new userController()
