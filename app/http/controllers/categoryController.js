const controller = require('app/http/controllers/controller')
const Category = require('app/models/category')
const Course = require('app/models/course')

class categoryController extends controller {
  async index(req, res, next) {
    try {
      let category = await Category.findById(req.params.categoryId)
        .populate('courses')
        .exec()
      let categoryCourses = []
      for (let course of category.courses) categoryCourses.push(course)
      let page = req.query.page || 1
      let courses = await Course.paginate(
        { _id: { $in: categoryCourses } },
        {
          page,
          sort: { createdAt: -1 },
          limit: 1,
        }
      )

      res.render('home/pages/category', {
        category,
        courses: courses.docs,
        coursesAlt: courses,
        title: 'دروس موضوع ' + category.name,
      })
    } catch (err) {
      next(err)
    }
  }
  async allCategories(req, res, next) {
    try {
      let page = req.query.page || 1
      let categories = await Category.paginate(
        {},
        {
          page,
          sort: { createdAt: -1 },
          limit: 3,
          populate: 'courses',
        }
      )

      res.render('home/pages/categories', {
        categories: categories.docs,
        categoriesAlt: categories,
        title: 'تمامی دسته های موجود',
      })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = new categoryController()
