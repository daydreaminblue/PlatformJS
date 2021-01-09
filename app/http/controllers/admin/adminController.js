const controller = require('app/http/controllers/controller')
const Order = require('app/models/order')
const User = require('app/models/user')
const Course = require('app/models/course')
const Episode = require('app/models/episode')
const Category = require('app/models/category')
const Comment = require('app/models/comment')

class adminController extends controller {
  async index(req, res, next) {
    try {
      let page = req.query.page || 1
      let orders = await Order.paginate(
        {},
        { page, sort: { createdAt: 1 }, limit: 4, populate: ['course', 'user'] }
      )

      let courses = await Course.find({})
      let episodes = await Episode.find({})
      let categoris = await Category.find({})

      let comments = await Comment.paginate(
        { approved: false },
        {
          page,
          sort: { createdAt: -1 },
          limit: 2,
          populate: [
            {
              path: 'user',
              select: 'name',
            },
            'course',
            {
              path: 'episode',
              populate: [
                {
                  path: 'course',
                  select: 'slug',
                },
              ],
            },
          ],
        }
      )

      res.render('admin/pages/index', {
        orders: orders.docs,
        ordersAlt: orders,
        comments: comments.docs,
        commentsAlt: comments,
        courses,
        episodes,
        categoris,
        title: 'داشبورد',
      })
    } catch (err) {
      next(err)
    }
  }
  async report(req, res, next) {
    try {
      let page = req.query.page || 1
      let orders = await Order.paginate(
        {},
        { page, sort: { createdAt: 1 }, limit: 4, populate: 'course' }
      )

      let totalIncoming = 0
      let totalBenefit = 0
      for (let i = 0; i < orders.docs.length; i++)
        totalIncoming += Number(orders.docs[i].course.price)
      totalBenefit = 0.6 * totalIncoming

      res.render('admin/pages/admin-report', {
        ordersAlt: orders,
        totalIncoming,
        totalBenefit,
        title: 'گزارش آماری مخصوص مدیر',
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

      res.render('admin/pages/orders', { orders, title: 'لیست سفارش ها' })
    } catch (err) {
      next(err)
    }
  }

}

module.exports = new adminController()
