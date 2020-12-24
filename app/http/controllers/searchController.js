const controller = require('app/http/controllers/controller')
const Course = require('app/models/course')

class contactController extends controller {
  async index(req, res) {
    try {
      let query = {}

      if (req.query.type === 'title') {
        query.title = req.query.search
      } else if (req.query.type === 'id') {
        query.idNumber = req.query.search
      }

      let courses = Course.find({ ...query })
      courses = await courses.exec()

      res.render('search', { courses })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = new contactController()
