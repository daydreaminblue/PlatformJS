const controller = require('app/http/controllers/controller')
const Teacher = require('app/models/teacher')

class teacherController extends controller {
  async teacherOrderDestroy(req, res, next) {
    try {
      this.isMongoId(req.params.id)

      let order = await Teacher.findById(req.params.id)
      order.remove()

      return res.redirect('/cart')
    } catch (err) {
      next(err)
    }
  }

  async teacher(req, res, next) {
    return res.render('home/teacher')
  }

  async teacherReq(req, res, next) {
    let newReq = new Teacher({
      user: req.params.id,
    })
    await newReq.save()
    return res.redirect('/')
  }
}

module.exports = new teacherController()
