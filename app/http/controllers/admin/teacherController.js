const controller = require('app/http/controllers/controller')
const Teacher = require('app/models/teacher')
const User = require('app/models/user')
const fs = require('fs')

class teacherController extends controller {
  async index(req, res, next) {
    try {
      let page = req.query.page || 1
      let teachers = await Teacher.paginate(
        { status: ['accepted', 'denied'] },
        {
          page,
          sort: { createdAt: -1 },
          limit: 5,
          populate: [
            {
              path: 'user',
              select: 'name',
            },
          ],
        }
      )

      res.render('admin/teachers/index', {
        title: 'مدرس های بررسی شده',
        teachers: teachers.docs,
        teachersAlt: teachers,
      })
    } catch (err) {
      next(err)
    }
  }
  async approved(req, res, next) {
    try {
      let page = req.query.page || 1
      let teachers = await Teacher.paginate(
        { status: 'wait' },
        {
          page,
          sort: { createdAt: -1 },
          limit: 5,
          populate: [
            {
              path: 'user',
              select: 'name',
            },
          ],
        }
      )

      res.render('admin/teachers/approved', {
        title: 'مدرس های بررسی نشده',
        teachers: teachers.docs,
        teachersAlt: teachers,
      })
    } catch (err) {
      next(err)
    }
  }
  async review(req, res, next) {
    try {
      let teachers = await Teacher.paginate(
        { _id: req.params.id },
        {
          populate: [
            {
              path: 'user',
              select: ['name', 'email'],
            },
          ],
        }
      )

      let resumeType = teachers.docs[0].resume.endsWith('.png')
        ? 'image'
        : teachers.docs[0].resume.endsWith('.pdf')
        ? 'document'
        : null

      res.render('admin/teachers/review', {
        title: 'بررسی وضعیت مدرس درخواست کننده',
        teacher: teachers.docs[0],
        resumeType,
      })
    } catch (err) {
      next(err)
    }
  }

  async report(req, res, next) {
    try {
      let teacher = await Teacher.findOne({ user: req.user._id })

      res.render('admin/teachers/teacher-report', {
        salesCount: teacher.salesCount,
        totalBenefit: teacher.wallet,
        title: 'گزارش آماری مخصوص شما',
      })
    } catch (err) {
      next(err)
    }
  }

  async approve(req, res, next) {
    try {
      this.isMongoId(req.params.id)

      const result = await Teacher.findByIdAndUpdate(req.params.id, {
        $set: { status: 'accepted' },
      })
      await User.findByIdAndUpdate(result.user, {
        $set: { isTeacher: true },
      })
      return res.redirect('/admin/teachers')
    } catch (err) {
      next(err)
    }
  }
  async deny(req, res, next) {
    try {
      this.isMongoId(req.params.id)

      const result = await Teacher.findByIdAndUpdate(req.params.id, {
        $set: { status: 'denied' },
      })
      await User.findByIdAndUpdate(result.user, {
        $set: { isTeacher: false },
      })
      return res.redirect('/admin/teachers')
    } catch (err) {
      next(err)
    }
  }

  async teacherPage(req, res, next) {
    return res.render('home/teacher', { title: 'مدرس شوید' })
  }
  async teacherReq(req, res, next) {
    try {
      let status = await this.validationData(req)
      if (!status) {
        if (req.file) fs.unlinkSync(req.file.path)
        return this.back(req, res)
      }

      let resume = this.getUrlResume(req.file)

      let newReq = new Teacher({
        user: req.params.id,
        ...req.body,
        resume,
      })
      await newReq.save()

      return res.redirect('/panel')
    } catch (err) {
      next(err)
    }
  }
  getUrlResume(resume) {
    return `${resume.destination}/${resume.filename}`.substring(8)
  }
}

module.exports = new teacherController()
