const controller = require('app/http/controllers/controller')
const Course = require('app/models/course')

class homeController extends controller {
  async index(req, res) {
    let courses = null
    try {
      courses = await Course.find({})
    } catch (err) {
      console.log(err)
    }
    res.status(200).render('home/index', { courses })
  }
}

module.exports = new homeController()
