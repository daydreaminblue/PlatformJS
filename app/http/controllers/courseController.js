const controller = require('app/http/controllers/controller')
const Course = require('app/models/course')

class courseController extends controller {
  async index(req, res) {
    let query = {}
    let { search } = req.query

    if (search) query.title = new RegExp(search, 'gi')

    let courses = Course.find({ ...query })
  }
  async x(req, res, next) {
    try {
      this.isMongoId(req.body.course)
      let course = await Course.findById(req.body.course)

      let orders = await Order.find({ user: req.user.id })
        .populate([
          {
            path: 'user',
            select: 'name',
          },
        ])
        .sort({ createdAt: 1 })
        .limit(80)
        .exec()

      let theUser = await User.findById(req.user.id)

      for (let i = 0; i < orders.length; i++) {
        if (orders[i].user._id.equals(theUser._id)) {
          if (orders[i].course._id.equals(course._id)) {
            return res.redirect('/#')
          }
        }
      }

      let newOrder = new Order({
        user: req.user.id,
        course: course.id,
        cname: course.title,
        price: course.price,
      })
      newOrder.save()

      console.log(orders)

      return res.redirect(req.originalUrl)
    } catch (err) {
      next(err)
    }
  }

  async y(req, res) {
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
    let theUser = await User.findById(req.user.id)

    res.render('home/cart', { orders, theUser, title: 'پنل کاربری' })
  }
}

module.exports = new courseController()
