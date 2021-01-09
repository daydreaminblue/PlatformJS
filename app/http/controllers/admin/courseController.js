const controller = require('app/http/controllers/controller')
const Course = require('app/models/course')
const Episode = require('app/models/episode')
const Comment = require('app/models/comment')
const Category = require('app/models/category')
const Order = require('app/models/order')
const User = require('app/models/user')
const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

class courseController extends controller {
  async index(req, res) {
    try {
      let page = req.query.page || 1
      let courses = await Course.paginate(
        {},
        {
          page,
          sort: { createdAt: -1 },
          limit: 5,
          populate: ['user', 'category'],
        }
      )

      res.render('admin/courses/index', {
        courses: courses.docs,
        coursesAlt: courses,
        title: 'دوره ها',
      })
    } catch (err) {
      next(err)
    }
  }
  async courseEpisodes(req, res) {
    try {
      let course = await Course.findById(req.params.courseId)
      let page = req.query.page || 1
      let episodes = await Episode.paginate(
        { course: req.params.courseId },
        {
          page,
          sort: { createdAt: -1 },
          limit: 5,
          populate: ['course'],
        }
      )

      res.render('admin/courses/courseEpisodes', {
        title: 'ویدیو های دوره ی ' + course.title,
        episodes: episodes.docs,
        episodesAlt: episodes,
      })
    } catch (err) {
      next(err)
    }
  }

  async createVideo(req, res, next) {
    try {
      this.isMongoId(req.params.courseId)

      let course = await Course.findById(req.params.courseId)
      if (!course) this.error('چنین دوره ای وجود ندارد', 404)

      return res.render('admin/courses/video-create', {
        course,
        title: 'اضافه کردن ویدیو چکیده',
      })
    } catch (err) {
      next(err)
    }
  }
  async storeVideo(req, res, next) {
    try {
      let status = await this.validationData(req)
      if (!status) {
        if (req.file) fs.unlinkSync(req.file.path)
        return this.back(req, res)
      }

      const video = this.getUrlVideo(req.file)

      delete req.body.video

      await Course.findByIdAndUpdate(req.params.courseId, {
        $set: { video },
      })

      return res.redirect('/admin/courses')
    } catch (err) {
      next(err)
    }
  }
  async editVideo(req, res, next) {
    try {
      this.isMongoId(req.params.courseId)

      let course = await Course.findById(req.params.courseId)
      if (!course) this.error('چنین دوره ای وجود ندارد', 404)

      return res.render('admin/courses/video-edit', { course })
    } catch (err) {
      next(err)
    }
  }

  async create(req, res) {
    let categories = await Category.find({})
    res.render('admin/courses/create', {
      categories,
      title: 'اضافه کردن دوره جدید',
    })
  }
  async store(req, res, next) {
    try {
      let status = await this.validationData(req)
      if (!status) {
        if (req.file) fs.unlinkSync(req.file.path)
        return this.back(req, res)
      }

      let images = this.imageResize(req.file)
      let { title, category, body, price, summary } = req.body

      let newCourse = new Course({
        user: req.user._id,
        teacher: req.user._id,
        category,
        title,
        slug: this.slug(title),
        body,
        price,
        images,
        summary,
        thumb: images[480],
      })

      await newCourse.save()

      await Category.findByIdAndUpdate(newCourse.category, {
        $push: { courses: newCourse._id },
      })

      return res.redirect('/admin/courses')
    } catch (err) {
      next(err)
    }
  }
  async edit(req, res, next) {
    try {
      this.isMongoId(req.params.courseId)

      let course = await Course.findById(req.params.courseId)
      if (!course) this.error('چنین دوره ای وجود ندارد', 404)

      let categories = await Category.find({})

      return res.render('admin/courses/edit', {
        course,
        categories,
        title: 'ویرایش دوره ' + course.title,
      })
    } catch (err) {
      next(err)
    }
  }
  async update(req, res, next) {
    try {
      let course = await Course.findById(req.params.courseId)

      let status = await this.validationData(req)
      if (!status) {
        if (req.file) fs.unlinkSync(req.file.path)
        return this.back(req, res)
      }

      let objForUpdate = {}

      // check image
      if (req.file) {
        objForUpdate.images = this.imageResize(req.file)
        objForUpdate.thumb = objForUpdate.images[480]
      }

      delete req.body.images
      objForUpdate.slug = this.slug(req.body.title)

      await Course.findByIdAndUpdate(req.params.courseId, {
        $set: { ...req.body, ...objForUpdate },
      })
      if (course.offPercentage !== Number(req.body.offPercentage))
        await course.off(Number(req.body.offPercentage))

      if (req.body.category !== course.category) {
        await Category.findByIdAndUpdate(course.category, {
          $pull: { courses: course._id },
        })
        await Category.findByIdAndUpdate(req.body.category, {
          $push: { courses: course._id },
        })
      }

      return res.redirect('/admin/courses')
    } catch (err) {
      next(err)
    }
  }
  async destroy(req, res, next) {
    try {
      this.isMongoId(req.params.courseId)

      let course = await Course.findById(req.params.courseId)
        .populate('episodes')
        .exec()
      if (!course) this.error('چنین دوره ای وجود ندارد', 404)

      // delete episodes
      course.episodes.forEach((episode) => episode.remove())

      // delete comments
      await Comment.deleteMany({ course: course._id })

      // delete Images
      //Object.values(course.images).forEach(image => fs.unlinkSync(`./public${image}`));

      // delete course
      course.remove()

      // delete course from users' likes
      await User.updateMany(
        {},
        {
          $pull: { likes: course._id },
        }
      )

      // delete course from users' bookmarks
      await User.updateMany(
        {},
        {
          $pull: { bookmarks: course._id },
        }
      )

      // delete course from category
      await Category.findByIdAndUpdate(course.category, {
        $pull: { courses: course._id },
      })

      // delete course from orders
      let orders = await Order.find({ course: req.params.courseId })
      orders.forEach((order) => order.remove())

      return res.redirect('/admin/courses')
    } catch (err) {
      next(err)
    }
  }

  imageResize(image) {
    const imageInfo = path.parse(image.path)

    let addresImages = {}
    addresImages['original'] = this.getUrlImage(
      `${image.destination}/${image.filename}`
    )

    const resize = (size) => {
      let imageName = `${imageInfo.name}-${size}${imageInfo.ext}`

      addresImages[size] = this.getUrlImage(`${image.destination}/${imageName}`)

      sharp(image.path)
        .resize(size, null)
        .toFile(`${image.destination}/${imageName}`)
    }

    ;[1080, 720, 480].map(resize)

    return addresImages
  }
  getUrlImage(dir) {
    return dir.substring(8)
  }
}

module.exports = new courseController()
