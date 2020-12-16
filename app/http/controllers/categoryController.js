const controller = require('app/http/controllers/controller')
const Category = require('app/models/category')
const Course = require('app/models/course')

class categoryController extends controller {
  async index(req, res) {
    let results = await Category.find({ slug: req.params.category })
    let category = results[0]
    let courseTemp
    category.courseArray = []
    for (let j = category.coursess.length - 1; j >= 0; j--) {
      courseTemp = await Course.findById(category.coursess[j])
      category.courseArray.push(courseTemp)
    }

    res.render('home/category', {
      title: category.name,
      cat: category,
    })
  }
}

module.exports = new categoryController()
