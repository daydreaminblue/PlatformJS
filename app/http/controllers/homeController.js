const controller = require('app/http/controllers/controller')
const Course = require('app/models/course')
const Category = require('app/models/category')
const Order = require('app/models/order')
const Teacher = require('app/models/teacher')

class homeController extends controller {
  async index(req, res) {
    let categories = await Category.find({})
    let courseTemp
    for (let i = 0; i < categories.length; i++) {
      categories[i].courseArray = []
      for (let j = categories[i].coursess.length - 1; j >= 0; j--) {
        if (categories[i].courseArray.length === 3) break
        courseTemp = await Course.findById(categories[i].coursess[j])
        categories[i].courseArray.push(courseTemp)
      }
    }

    const offedCourses = await Course.find({ offPercentage: { $gt: 1 } })
      .sort({ createdAt: -1 })
      .limit(6)
      .exec()

    let courses = await Course.find({})
    let orders = await Order.find({})

    res.status(200).render('home/index', {
      categories,
      offedCourses,
      coursesCount: courses.length,
      categoriesCount: categories.length,
      ordersCount: orders.length,
    })
  }

  async about(req, res) {
    res.status(200).render('home/about')
  }

  async orderDestroy(req, res, next) {
    try {
      this.isMongoId(req.params.id)

      let order = await Order.findById(req.params.id)
      order.remove()

      return res.redirect('/cart')
    } catch (err) {
      next(err)
    }
  }

  async teacher(req, res, next) {
    return res.render('home/teacher')
  }

  async teacherReq(req, res, next) {
    let newReq = new Teacher({
      user: req.params.id,
    })
    await newReq.save()
    return res.redirect('/')
  }
}

module.exports = new homeController()
