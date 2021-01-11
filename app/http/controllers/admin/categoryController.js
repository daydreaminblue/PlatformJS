const controller = require('app/http/controllers/controller')
const Category = require('app/models/category')
const Course = require('app/models/course')

class categoryController extends controller {
  async index(req, res, next) {
    try {
      let page = req.query.page || 1
      let categories = await Category.paginate(
        {},
        { page, sort: { createdAt: -1 }, limit: 20, populate: 'parent' }
      )

      res.render('admin/categories/index', { categories, title: 'دسته ها' })
    } catch (err) {
      next(err)
    }
  }
  async categoryCourses(req, res,next) {
    try {
      let category = await Category.findById(req.params.categoryId)
      let page = req.query.page || 1
      let courses = await Course.paginate(
        { category: req.params.categoryId },
        {
          page,
          sort: { createdAt: -1 },
          limit: 6,
        }
      )

      res.render('admin/categories/categoryCourses', {
        title: 'دوره های دسته ی ' + category.name,
        courses: courses.docs,
        coursesAlt: courses,
      })
    } catch (err) {
      next(err)
    }
  }
  async create(req, res, next) {
    try {
      let categories = await Category.find({ parent: null })

      res.render('admin/categories/create', {
        categories,
        title: 'ایجاد دسته جدید',
      })
    } catch (err) {
      next(err)
    }
  }
  async store(req, res, next) {
    try {
      let status = await this.validationData(req)
      if (!status) return this.back(req, res)

      let { name, parent } = req.body

      let newCategory = new Category({
        name,
        slug: this.slug(name),
        parent: parent !== 'none' ? parent : null,
      })

      await newCategory.save()

      return res.redirect('/admin/categories')
    } catch (err) {
      next(err)
    }
  }
  async edit(req, res, next) {
    try {
      this.isMongoId(req.params.categoryId)

      let category = await Category.findById(req.params.categoryId)
      let categories = await Category.find({ parent: null })
      if (!category) this.error('چنین دسته ای وجود ندارد', 404)

      return res.render('admin/categories/edit', {
        category,
        categories,
        title: 'ویرایش دسته ی ' + category.name,
      })
    } catch (err) {
      next(err)
    }
  }
  async update(req, res, next) {
    try {
      let status = await this.validationData(req)
      if (!status) return this.back(req, res)

      let { name, parent } = req.body

      await Category.findByIdAndUpdate(req.params.categoryId, {
        $set: {
          name,
          slug: this.slug(name),
          parent: parent !== 'none' ? parent : null,
        },
      })

      return res.redirect('/admin/categories')
    } catch (err) {
      next(err)
    }
  }
  async destroy(req, res, next) {
    try {
      this.isMongoId(req.params.categoryId)

      let category = await Category.findById(req.params.categoryId)
        .populate('childs')
        .exec()
      if (!category) this.error('چنین دسته ای وجود ندارد', 404)

      category.childs.forEach((category) => category.remove())

      // delete category
      category.remove()

      return res.redirect('/admin/categories')
    } catch (err) {
      next(err)
    }
  }
}

module.exports = new categoryController()
