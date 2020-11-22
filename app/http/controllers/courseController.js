const controller = require('app/http/controllers/controller')
const Course = require('app/models/course')

class courseController extends controller {
  async index(req, res) {
    let query = {}
    let { search } = req.query

    if (search) query.title = new RegExp(search, 'gi')

    let courses = Course.find({ ...query })
  }
}

module.exports = new courseController()
