const controller = require('app/http/controllers/controller')
const User = require('app/models/user')
const Course = require('app/models/course')

class adminController extends controller {
  async index(req, res) {
    try {
      let courses = await Course.find()
      res.render('admin/index', { courses })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = new adminController()
