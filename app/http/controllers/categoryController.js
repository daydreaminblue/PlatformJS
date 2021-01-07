const controller = require('app/http/controllers/controller')
const Category = require('app/models/category')

class categoryController extends controller {
  async index(req, res, next) {
    try {
      let page = req.query.page || 1
      let category = await Category.paginate(
        { slug: req.params.category },
        {
          page,
          sort: { createdAt: 1 },
          populate: [
            {
              path: 'courses',
            },
          ],
        }
      )
      
      res.render('home/category', {
        title: 'دروس موضوع ' + category.docs[0].name,
        category: category.docs[0],
        categoryAlt: category,
      })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = new categoryController()
