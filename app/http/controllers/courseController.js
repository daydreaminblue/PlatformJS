const controller = require('app/http/controllers/controller')
const Course = require('app/models/course')
const Episode = require('app/models/episode')
const User = require('app/models/user')
const Teacher = require('app/models/teacher')
const Order = require('app/models/order')
const Comment = require('app/models/comment')

class courseController extends controller {
  async orderCourse(req, res, next) {
    try {
      this.isMongoId(req.params.courseId)

      let theUser = await User.findById(req.user.id)

      let flag = true
      for (let i = 0; i < theUser.orders.length; i++)
        if (theUser.orders.includes(req.params.courseId)) flag = false

      if (flag) {
        let newOrder = new Order({
          user: req.user._id,
          course: req.params.courseId,
        })
        await newOrder.save()

        let course = await Course.findByIdAndUpdate(req.params.courseId, {
          $inc: { salesCount: 1 },
        })

        let share = 0.4 * Number(course.price)
        await Teacher.findOneAndUpdate(
          { user: course.user },
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

  async likeCourse(req, res, next) {
    try {
      this.isMongoId(req.params.courseId)
      await User.findByIdAndUpdate(req.user._id, {
        $push: { likes: req.params.courseId },
      })
      await Course.findByIdAndUpdate(req.params.courseId, {
        $inc: { likesCount: 1 },
      })
      return this.back(req, res)
    } catch (err) {
      next(err)
    }
  }
  async destroyLikeCourse(req, res, next) {
    try {
      this.isMongoId(req.params.courseId)

      await User.findByIdAndUpdate(req.user._id, {
        $pull: { likes: req.params.courseId },
      })
      await Course.findByIdAndUpdate(req.params.courseId, {
        $inc: { likesCount: -1 },
      })

      return this.back(req, res)
    } catch (err) {
      next(err)
    }
  }

  async bookmarkCourse(req, res, next) {
    try {
      this.isMongoId(req.params.courseId)
      await User.findByIdAndUpdate(req.user._id, {
        $push: { bookmarks: req.params.courseId },
      })
      return this.back(req, res)
    } catch (err) {
      next(err)
    }
  }
  async destroyBookmarkCourse(req, res, next) {
    try {
      this.isMongoId(req.params.courseId)

      await User.findByIdAndUpdate(req.user._id, {
        $pull: { bookmarks: req.params.courseId },
      })

      return this.back(req, res)
    } catch (err) {
      next(err)
    }
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
          options: { sort: { createdAt: -1 } },
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
              options: { sort: { createdAt: -1 } },
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

    let targetEpisode
    if (req.params.episode) {
      targetEpisode = await Episode.findOne({ slug: req.params.episode })
    }

    const user = await User.findById(req.user._id)
    let likeFlag = false
    let bookmarkFlag = false
    for (let i = 0; i < user.likes.length; i++)
      if (user.likes[i]._id.equals(course._id)) {
        likeFlag = true
        break
      }
    for (let i = 0; i < user.bookmarks.length; i++)
      if (user.bookmarks[i]._id.equals(course._id)) {
        bookmarkFlag = true
        break
      }

    let teacherFlag = req.user._id.equals(course.user._id)
    console.log(req.user._id.equals(course.user._id))

    res.render('home/single', {
      course,
      flag,
      title: course.title,
      targetEpisode,
      user,
      likeFlag,
      bookmarkFlag,
      teacherFlag,
    })
  }
  async comment(req, res, next) {
    try {
      let status = await this.validationData(req)
      if (!status) return this.back(req, res)

      let newComment = new Comment({
        user: req.user.id,
        ...req.body,
      })

      await newComment.save()

      return this.back(req, res)
    } catch (err) {
      next(err)
    }
  }


  async payment(req, res, next) {
    try {
      this.isMongoId(req.body.courseId)

      let course = await Course.findById(req.params.courseId)

      // buy proccess
      let params = {
        MerchantID: '',
        Amount: course.price,
        CallbackURL: 'http://localhost:3000/payment/checker',
        Description: `بابت خرید دوره ${course.title}`,
        Email: req.user.email,
      }

      let options = this.getUrlOption(
        'https://www.zarinpal.com/pg/rest/WebGate/PaymentRequest.json',
        params
      )

      request(options)
        .then(async (data) => {
          await Order.findByIdAndUpdate(orderId, {
            resnumber: data.Authority,
          })

          res.redirect(`https://www.zarinpal.com/pg/StartPay/${data.Authority}`)
        })
        .catch((err) => res.json(err.message))
    } catch (err) {
      next(err)
    }
  }
  async checker(req, res, next) {
    try {
      if (req.query.Status && req.query.Status !== 'OK')
        return this.alertAndBack(req, res, {
          title: 'دقت کنید',
          message: 'پرداخت شما با موفقیت انجام نشد',
        })

      let order = await Order.findOne({ resnumber: req.query.Authority })
        .populate('course')
        .exec()

      let params = {
        MerchantID: '',
        Amount: order.course.price,
        Authority: req.query.Authority,
      }

      let options = this.getUrlOption(
        'https://www.zarinpal.com/pg/rest/WebGate/PaymentVerification.json',
        params
      )

      request(options)
        .then(async (data) => {
          if (data.Status == 100) {
            order.set({ done: true })

            await order.save()

            this.alert(req, {
              title: 'با تشکر',
              message: 'عملیات مورد نظر با موفقیت انجام شد',
              type: 'success',
              button: 'بسیار خوب',
            })

            res.redirect(order.course.path())
          } else {
            this.alertAndBack(req, res, {
              title: 'دقت کنید',
              message: 'پرداخت شما با موفقیت انجام نشد',
            })
          }
        })
        .catch((err) => {
          next(err)
        })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = new courseController()
