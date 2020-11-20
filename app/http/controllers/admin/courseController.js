const controller = require('app/http/controllers/controller')
const Course = require('app/models/course')

class courseController extends controller {
  async index(req, res) {
    try {
      let page = req.query.page || 1
      let courses = await Course.paginate(
        {},
        { page, sort: { createdAt: 1 }, limit: 5 }
      )
      res.render('admin/courses/index', { title: 'دوره ها', courses })
    } catch (err) {
      next(err)
    }
  }

  async create(req, res) {
    res.render('admin/courses/create')
  }

  async store(req, res, next) {
    try {
      let status = await this.validationData(req)
      if (!status) {
        return this.back(req, res)
      }

      // create course
      let { title, category, body, price, tags } = req.body

      let newCourse = new Course({
        user: req.user._id,
        category,
        title,
        slug: this.slug(title),
        body,
        price,
        tags,
      })

      await newCourse.save()

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

      return res.render('admin/courses/edit', { course })
    } catch (err) {
      next(err)
    }
  }

  async update(req, res, next) {
    try {
      let course = await Course.findById(req.params.id)

      let status = await this.validationData(req)
      if (!status) {
        return this.back(req, res)
      }

      let objForUpdate = {}
      objForUpdate.slug = this.slug(req.body.title)

      await Course.findByIdAndUpdate(req.params.id, {
        $set: { ...req.body, ...objForUpdate },
      })

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

      course.remove()

      return res.redirect('/admin/courses')
    } catch (err) {
      next(err)
    }
  }
}

module.exports = new courseController()
