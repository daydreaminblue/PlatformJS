const controller = require('app/http/controllers/controller')
const Order = require('app/models/order')
const User = require('app/models/user')
const Course = require('app/models/course')
const Episode = require('app/models/episode')
const Category = require('app/models/category')
const Teacher = require('app/models/teacher')

class orderController extends controller {
  async index(req, res) {
    try {
      let page = req.query.page || 1
      let orders = await Order.paginate(
        {},
        { page, sort: { createdAt: 1 }, limit: 4 }
      )

      let userTemp
      let courseTemp
      for (let i = 0; i < orders.docs.length; i++) {
        orders.docs[i].userTitle = 0
        orders.docs[i].courseTitle = 0
        orders.docs[i].coursePrice = 0
        userTemp = await User.findById(orders.docs[i].user)
        courseTemp = await Course.findById(orders.docs[i].course)
        if (orders.docs[i].user !== null) {
          orders.docs[i].userTitle = userTemp.name
          orders.docs[i].courseTitle = courseTemp.title
          orders.docs[i].coursePrice = courseTemp.price
        }
      }

      let courses = await Course.find()
      let episodes = await Episode.find()
      let categoris = await Category.find()
      let ordersForLength = await Order.find()

      res.render('admin/index', {
        orders,
        courses,
        episodes,
        categoris,
        ordersForLength,
      })
    } catch (err) {
      next(err)
    }
  }

  async showOrderList(req, res) {
    try {
      let orders = await Order.find({ user: req.user.id })
        .populate([
          {
            path: 'user',
            select: 'name',
          },
          {
            path: 'course',
            select: ['title', 'price'],
          },
        ])
        .sort({ createdAt: 1 })
        .limit(80)
        .exec()

      res.render('admin/orders', { title: 'لیست سفارش ها', orders })
    } catch (err) {
      next(err)
    }
  }

  async teacherList(req, res) {
    try {
      let teachers = await Teacher.find({})
        .sort({ createdAt: -1 })
        .limit(80)
        .exec()

      res.render('admin/teachers', { title: 'لیست مدرس ها', teachers })
    } catch (err) {
      next(err)
    }
  }

  async orderDestroy(req, res, next) {
    try {
      this.isMongoId(req.params.id)

      let order = await Order.findById(req.params.id)
      order.remove()

      return res.redirect('/admin/orders')
    } catch (err) {
      next(err)
    }
  }

  uploadImage(req, res) {
    let image = req.file
    res.json({})
  }
}

module.exports = new orderController()
