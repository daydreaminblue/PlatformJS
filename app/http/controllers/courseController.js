const controller = require('app/http/controllers/controller')
const Course = require('app/models/course')
const User = require('app/models/user')
const Order = require('app/models/order')

class courseController extends controller {
  async search(req, res) {
    let query = {}
    let { search } = req.query
    if (search) query.title = new RegExp(search, 'gi')
    let page = req.query.page || 1
    let courses = await Course.paginate(
      { ...query },
      { page, sort: { createdAt: 1 }, limit: 2 }
    )

    res.render('home/search', {
      title: search ? 'عبارت جستجو شده :' + ' ' + search : 'جستجو',
      courses: courses.docs,
      coursesAlt: courses,
    })
  }

  async allCourses(req, res) {
    try {
      let page = req.query.page || 1
      let courses = await Course.paginate(
        {},
        { page, sort: { createdAt: 1 }, limit: 6 }
      )
      res.render('home/allcourses', {
        title: 'همه دروس',
        courses: courses.docs,
        coursesAlt: courses,
      })
    } catch (err) {
      next(err)
    }
  }

  async mostViewedCourses(req, res) {
    try {
      let page = req.query.page || 1
      let courses = await Course.paginate(
        {},
        { page, sort: { viewCount: -1 }, limit: 6 }
      )
      res.render('home/mostview', {
        title: 'پربازدید ترین دروس',
        courses: courses.docs,
        coursesAlt: courses,
      })
    } catch (err) {
      next(err)
    }
  }

  async orderCourse(req, res, next) {
    try {
      this.isMongoId(req.params.courseId)

      let course = await Course.findById(req.params.courseId)
      let theUser = await User.findById(req.user.id)

      let flag = true
      for (let i = 0; i < theUser.orders.length; i++)
        if (theUser.orders.includes(req.params.courseId)) flag = false

      if (flag) {
        let newOrder = new Order({
          user: req.user.id,
          course: course.id,
        })

        await newOrder.save()
      }

      return this.back(req, res)
    } catch (err) {
      next(err)
    }
  }

  async showCart(req, res) {
    let page = req.query.page || 1
    let orders = await Order.paginate(
      { user: req.user.id },
      { page, sort: { createdAt: 1 }, limit: 3, populate: 'course' }
    )

    let theUser = await User.findById(req.user.id)

    res.render('home/cart', {
      orders: orders.docs,
      ordersAlt: orders,
      theUser,
      title: 'پنل کاربری',
    })
  }

  async single(req, res) {
    let course = await Course.findOneAndUpdate(
      { slug: req.params.course },
      { $inc: { viewCount: 1 } }
    )
      .populate([
        {
          path: 'user',
          select: 'name',
        },
        {
          path: 'episodes',
          options: { sort: { number: 1 } },
        },
      ])
      .populate([
        {
          path: 'comments',
          match: {
            parent: null,
            approved: true,
          },
          populate: [
            {
              path: 'user',
              select: 'name',
            },
            {
              path: 'comments',
              match: {
                approved: true,
              },
              populate: { path: 'user', select: 'name' },
            },
          ],
        },
      ])

    let flag = false

    if (req.user) {
      let theUser = await User.findById(req.user.id)

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

      for (let i = 0; i < orders.length; i++) {
        if (orders[i].user._id.equals(theUser._id)) {
          if (orders[i].course._id.equals(course._id)) {
            flag = true
          }
        }
      }
    }

    res.render('home/single', { course, flag, title: course.title })
  }

  async allTeachers(req, res) {
    try {
      let page = req.query.page || 1
      let teachers = await Teacher.paginate(
        {},
        { page, sort: { createdAt: 1 }, limit: 6 }
      )
      res.render('home/allteachers', {
        title: 'همه مدرسان',
        teachers,
      })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = new courseController()
