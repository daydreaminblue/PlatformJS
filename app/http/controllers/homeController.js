const controller = require('app/http/controllers/controller')
const Course = require('app/models/course')
const Comment = require('app/models/comment')
const Category = require('app/models/category')
const Order = require('app/models/order')
const User = require('app/models/user')
const Teacher = require('app/models/teacher')

class homeController extends controller {
  async index(req, res, next) {
    let page = req.query.page || 1
    let categories = await Category.paginate(
      {},
      {
        page,
        sort: { createdAt: -1 },
        limit: 3,
        populate: ['courses'],
      }
    )

    const offedCourses = await Course.find({ offPercentage: { $gt: 1 } })
      .sort({ createdAt: -1 })
      .limit(6)
      .exec()

    let courses = await Course.find({})
    let orders = await Order.find({})

    res.status(200).render('home/pages/index', {
      categories: categories.docs,
      categoriesAlt: categories,
      offedCourses,
      coursesCount: courses.length,
      ordersCount: orders.length,
    })
  }
  async search(req, res, next) {
    let query = {}
    let { search } = req.query
    if (search) query.title = new RegExp(search, 'gi')
    let page = req.query.page || 1
    let courses = await Course.paginate(
      { ...query },
      { page, sort: { createdAt: 1 }, limit: 2 }
    )

    res.render('home/pages/search', {
      courses: courses.docs,
      coursesAlt: courses,
      title: search ? 'عبارت جستجو شده : ' + search : 'جستجو',
    })
  }
  async about(req, res, next) {
    res.status(200).render('home/pages/about', { title: 'درباره ما' })
  }
  async allCourses(req, res, next) {
    try {
      let page = req.query.page || 1
      let courses = await Course.paginate(
        {},
        { page, sort: { createdAt: 1 }, limit: 6 }
      )
      res.render('home/courses/allcourses', {
        courses: courses.docs,
        coursesAlt: courses,
        title: 'همه دروس',
      })
    } catch (err) {
      next(err)
    }
  }
  async mostViewedCourses(req, res, next) {
    try {
      let page = req.query.page || 1
      let courses = await Course.paginate(
        {},
        { page, sort: { viewCount: -1 }, limit: 6 }
      )
      res.render('home/courses/mostview', {
        courses: courses.docs,
        coursesAlt: courses,
        page,
        title: 'پربازدید ترین دروس',
      })
    } catch (err) {
      next(err)
    }
  }

  async panel(req, res, next) {
    try {
      let user = await User.findById(req.user._id)
      let teachers = await Teacher.find({ user: req.user._id })
      let teacherStatus
      if (teachers.length > 0) teacherStatus = teachers[0].status
      if (teacherStatus == 'wait') teacherStatus = 'در حال بررسی'
      if (teacherStatus == 'accepted') teacherStatus = 'پذیرفته شده'
      if (teacherStatus == 'denied') teacherStatus = 'رد شده'
      res
        .status(200)
        .render('home/pages/panel', {
          user,
          teacherStatus,
          title: 'پنل کاربری',
        })
    } catch (err) {
      next(err)
    }
  }

  async showCart(req, res, next) {
    try {
      let page = req.query.page || 1
      let orders = await Order.paginate(
        { user: req.user.id, done: false },
        { page, sort: { createdAt: -1 }, limit: 6, populate: 'course' }
      )

      res.render('home/cart/cart', {
        orders: orders.docs,
        ordersAlt: orders,
        title: 'سبد خرید',
      })
    } catch (err) {
      next(err)
    }
  }
  async paidCourses(req, res, next) {
    try {
      let page = req.query.page || 1
      let orders = await Order.paginate(
        { user: req.user.id, done: true },
        { page, sort: { createdAt: -1 }, limit: 6, populate: 'course' }
      )
      res.render('home/courses/paid-courses', {
        orders: orders.docs,
        ordersAlt: orders,
        title: 'دوره های خریداری شده',
      })
    } catch (err) {
      next(err)
    }
  }
  async payOrder(req, res, next) {
    try {
      let order = await Order.findByIdAndUpdate(req.params.orderId, {
        done: true,
      })
        .populate('course')
        .exec()

      let course = await Course.findByIdAndUpdate(order.course._id, {
        $inc: { salesCount: 1 },
      })

      let share = 0.4 * Number(course.price)
      await Teacher.findOneAndUpdate(
        { user: course.user },
        {
          $inc: { wallet: share, salesCount: 1 },
        }
      )

      return this.back(req, res)
    } catch (err) {
      next(err)
    }
  }
  async payOrders(req, res, next) {
    try {
      let orders = await Order.find({ user: req.user._id })
      let courseIdList = []
      for (let i = 0; i < orders.length; i++)
        courseIdList.push(orders[i].course)

      await Order.updateMany(
        { user: req.user._id },
        {
          done: true,
        }
      )

      let course
      let courses = []
      for (let i = 0; i < courseIdList.length; i++) {
        course = await Course.findOneAndUpdate(
          { _id: courseIdList[i] },
          {
            $inc: { salesCount: 1 },
          }
        )
        courses.push({
          id: courseIdList[i],
          price: course.price,
          teacher: course.user,
        })
      }

      let share
      for (let i = 0; i < courses.length; i++) {
        share = 0.4 * Number(courses[i].price)
        await Teacher.findOneAndUpdate(
          { user: courses[i].teacher },
          {
            $inc: { wallet: share, salesCount: 1 },
          }
        )
      }

      return this.back(req, res)
    } catch (err) {
      next(err)
    }
  }
  async orderDestroy(req, res, next) {
    try {
      this.isMongoId(req.params.orderId)

      let order = await Order.findById(req.params.orderId)
      order.remove()

      return this.back(req, res)
    } catch (err) {
      next(err)
    }
  }

  async showComments(req, res, next) {
    try {
      let page = req.query.page || 1
      let comments = await Comment.paginate(
        { user: req.user.id, approved: true },
        {
          page,
          sort: { createdAt: -1 },
          limit: 5,
          populate: [
            {
              path: 'course',
              select: 'title',
            },
          ],
        }
      )

      let theUser = await User.findById(req.user.id)

      res.render('home/pages/self-comments', {
        comments: comments.docs,
        commentsAlt: comments,
        theUser,
        title: 'نظرات شما',
      })
    } catch (err) {
      next(err)
    }
  }
  async showLikes(req, res, next) {
    try {
      let user = await User.findById(req.user.id).populate('likes').exec()
      let userCourses = []
      for (let course of user.likes) userCourses.push(course)
      let page = req.query.page || 1
      let courses = await Course.paginate(
        { _id: { $in: userCourses } },
        {
          page,
          sort: { createdAt: -1 },
          limit: 6,
        }
      )

      res.render('home/courses/likes', {
        courses: courses.docs,
        coursesAlt: courses,
        title: ' دوره های پسند شده',
      })
    } catch (err) {
      next(err)
    }
  }
  async showBookmarks(req, res, next) {
    try {
      let user = await User.findById(req.user.id).populate('bookmarks').exec()
      let userCourses = []
      for (let course of user.bookmarks) userCourses.push(course)
      let page = req.query.page || 1
      let courses = await Course.paginate(
        { _id: { $in: userCourses } },
        {
          page,
          sort: { createdAt: -1 },
          limit: 6,
        }
      )

      res.render('home/courses/bookmarks', {
        courses: courses.docs,
        coursesAlt: courses,
        title: ' دوره های بوک مارک شده',
      })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = new homeController()
