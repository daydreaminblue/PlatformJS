const controller = require('app/http/controllers/controller')
const Course = require('app/models/course')
const Category = require('app/models/category')
const Order = require('app/models/order')
const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

class courseController extends controller {
  async index(req, res) {
    try {
      let page = req.query.page || 1
      let courses = await Course.paginate(
        {},
        { page, sort: { createdAt: -1 }, limit: 2 }
      )

      let cateTemp
      for (let i = 0; i < courses.docs.length; i++) {
        courses.docs[i].cateTitle = 0
        cateTemp = await Category.findById(courses.docs[i].category)
        if (cateTemp !== null) courses.docs[i].cateTitle = cateTemp.name
        else courses.docs[i].cateTitle = 'بدون دسته'
      }

      res.render('admin/courses/index', { title: 'دوره ها', courses })
    } catch (err) {
      next(err)
    }
  }

  async create(req, res) {
    let categories = await Category.find({})
    res.render('admin/courses/create', { categories })
  }

  async store(req, res, next) {
    try {
      let status = await this.validationData(req)
      if (!status) {
        if (req.file) fs.unlinkSync(req.file.path)
        return this.back(req, res)
      }

      // create course
      let images = this.imageResize(req.file)
      let { title, category, body, price, summary } = req.body

      let newCourse = new Course({
        user: req.user._id,
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
        $push: { coursess: newCourse._id },
      })

      return res.redirect('/admin/courses')
    } catch (err) {
      next(err)
    }
  }

  async edit(req, res, next) {
    try {
      this.isMongoId(req.params.id)

      let course = await Course.findById(req.params.id)
      if (!course) this.error('چنین دوره ای وجود ندارد', 404)

      let categories = await Category.find({})

      return res.render('admin/courses/edit', { course, categories })
    } catch (err) {
      next(err)
    }
  }

  async update(req, res, next) {
    try {
      let course = await Course.findById(req.params.id)

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

      await Course.findByIdAndUpdate(req.params.id, {
        $set: { ...req.body, ...objForUpdate },
      })
      if (course.offPercentage !== Number(req.body.offPercentage))
        await course.off(Number(req.body.offPercentage))

      if (req.body.category !== course.category) {
        await Category.findByIdAndUpdate(course.category, {
          $pull: { coursess: course._id },
        })
        await Category.findByIdAndUpdate(req.body.category, {
          $push: { coursess: course._id },
        })
      }

      return res.redirect('/admin/courses')
    } catch (err) {
      next(err)
    }
  }

  async destroy(req, res, next) {
    try {
      this.isMongoId(req.params.id)

      let course = await Course.findById(req.params.id)
        .populate('episodes')
        .exec()
      if (!course) this.error('چنین دوره ای وجود ندارد', 404)

      // delete episodes
      course.episodes.forEach((episode) => episode.remove())

      // delete Images
      //Object.values(course.images).forEach(image => fs.unlinkSync(`./public${image}`));

      // delete course
      course.remove()

      // delete course from category
      await Category.findByIdAndUpdate(course.category, {
        $pull: { coursess: course._id },
      })

      // delete course from orders
      let orders = await Order.find({ course: req.params.id })
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
