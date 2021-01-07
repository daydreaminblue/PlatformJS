const controller = require('app/http/controllers/controller')
const Course = require('app/models/course')
const Comment = require('app/models/comment')
const Category = require('app/models/category')
const Order = require('app/models/order')
const User = require('app/models/user')
const Teacher = require('app/models/teacher')

class homeController extends controller {
  async index(req, res, next) {
    let categories = await Category.find({})
    let courseTemp
    for (let i = 0; i < categories.length; i++) {
      categories[i].courseArray = []
      for (let j = categories[i].courses.length - 1; j >= 0; j--) {
        if (categories[i].courseArray.length === 3) break
        courseTemp = await Course.findById(categories[i].courses[j])
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
      categoriesCount: categories.length,
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

    res.render('home/search', {
      title: search ? 'عبارت جستجو شده :' + ' ' + search : 'جستجو',
      courses: courses.docs,
      coursesAlt: courses,
    })
  }
  async about(req, res, next) {
    res.status(200).render('home/about', { title: 'درباره ما' })
  }
  async allCourses(req, res, next) {
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
  async mostViewedCourses(req, res, next) {
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

  async panel(req, res, next) {
    let user = await User.findById(req.user._id)
    let teachers = await Teacher.find({ user: req.user._id })
    let teacherStatus
    if (teachers.length > 0) teacherStatus = teachers[0].status
    if (teacherStatus == 'wait') teacherStatus = 'در حال بررسی'
    if (teacherStatus == 'accepted') teacherStatus = 'پذیرفته شده'
    if (teacherStatus == 'denied') teacherStatus = 'رد شده'
    res
      .status(200)
      .render('home/panel', { title: 'پنل کاربری', user, teacherStatus })
  }
  async showCart(req, res, next) {
    let page = req.query.page || 1
    let orders = await Order.paginate(
      { user: req.user.id },
      { page, sort: { createdAt: -1 }, limit: 3, populate: 'course' }
    )

    let theUser = await User.findById(req.user.id)

    res.render('home/cart', {
      orders: orders.docs,
      ordersAlt: orders,
      theUser,
      title: 'پنل کاربری',
    })
  }
  async showComments(req, res, next) {
    let page = req.query.page || 1
    let comments = await Comment.paginate(
      { user: req.user.id, approved: true },
      {
        page,
        sort: { createdAt: -1 },
        limit: 3,
        populate: [
          {
            path: 'course',
            select: 'title',
          },
        ],
      }
    )

    let theUser = await User.findById(req.user.id)

    res.render('home/self-comments', {
      comments: comments.docs,
      commentsAlt: comments,
      theUser,
      title: 'نظرات شما',
    })
  }
  async showLikes(req, res, next) {
    try {
      let user = await User.paginate(
        { _id: req.user.id },
        { populate: 'likes' }
      )

      res.render('home/likes', {
        title: ' درس های پسند شده',
        courses: user.docs[0].likes,
      })
    } catch (err) {
      next(err)
    }
  }
  async showBookmarks(req, res, next) {
    try {
      let user = await User.paginate(
        { _id: req.user.id },
        { populate: 'bookmarks' }
      )

      res.render('home/bookmarks', {
        title: ' درس های بوک مارک شده',
        courses: user.docs[0].bookmarks,
      })
    } catch (err) {
      next(err)
    }
  }
  async orderDestroy(req, res, next) {
    try {
      this.isMongoId(req.params.id)

      let order = await Order.findById(req.params.id)
      let courseId = order.course
      order.remove()

      let course = await Course.findByIdAndUpdate(courseId, {
        $inc: { salesCount: -1 },
      })

      let share = -1 * 0.4 * Number(course.price)
      await Teacher.findOneAndUpdate(
        { user: course.user },
        {
          $inc: { wallet: share, salesCount: -1 },
        }
      )

      return this.back(req, res)
    } catch (err) {
      next(err)
    }
  }
}

module.exports = new homeController()
