const controller = require('app/http/controllers/controller')
const Course = require('app/models/course')
const Episode = require('app/models/episode')
const fs = require('fs')

class episodeController extends controller {
  async index(req, res, next) {
    try {
      let page = req.query.page || 1
      let episodes = await Episode.paginate(
        {},
        {
          page,
          sort: { createdAt: -1 },
          limit: 5,
          populate: 'course',
        }
      )
      res.render('admin/episodes/index', {
        episodes: episodes.docs,
        episodesAlt: episodes,
        title: 'ویدیو ها',
      })
    } catch (err) {
      next(err)
    }
  }
  async create(req, res, next) {
    let courses = await Course.find({})
    let course = null
    if (req.params.courseId) course = await Course.findById(req.params.courseId)
    res.render('admin/episodes/create', {
      courses,
      course,
      title: 'اضافه کردن قسمت جدید',
    })
  }
  async store(req, res, next) {
    try {
      let status = await this.validationData(req)
      if (!status) {
        if (req.file) fs.unlinkSync(req.file.path)
        return this.back(req, res)
      }
      const isFree =
        req.body.isFree === 'notfree'
          ? false
          : req.body.isFree === 'free'
          ? true
          : false

      const video = this.getUrlVideo(req.file)
      const slug = this.slug(req.body.title)

      let newEpisode = new Episode({ ...req.body, video, slug, isFree })
      await newEpisode.save()

      return res.redirect('/admin/episodes')
    } catch (err) {
      next(err)
    }
  }
  async edit(req, res, next) {
    try {
      this.isMongoId(req.params.episodeId)

      let episode = await Episode.findById(req.params.episodeId)
      let courses = await Course.find({})
      if (!episode) this.error('چنین ویدیو ای وجود ندارد', 404)

      return res.render('admin/episodes/edit', {
        episode,
        courses,
        title: 'ویرایش قسمت ' + episode.title,
      })
    } catch (err) {
      next(err)
    }
  }
  async update(req, res, next) {
    try {
      let status = await this.validationData(req)
      if (!status) {
        if (req.file) fs.unlinkSync(req.file.path)
        return this.back(req, res)
      }

      let objForUpdate = {}
      if (req.file) {
        objForUpdate.video = this.getUrlVideo(req.file)
      }
      delete req.body.video

      objForUpdate.isFree =
        req.body.isFree === 'notfree'
          ? false
          : req.body.isFree === 'free'
          ? true
          : false

      objForUpdate.slug = this.slug(req.body.title)

      await Episode.findByIdAndUpdate(req.params.episodeId, {
        $set: { ...req.body, ...objForUpdate },
      })

      return res.redirect('/admin/episodes')
    } catch (err) {
      next(err)
    }
  }
  async destroy(req, res, next) {
    try {
      this.isMongoId(req.params.episodeId)

      let episode = await Episode.findById(req.params.episodeId)
      if (!episode) this.error('چنین ویدیو ای وجود ندارد', 404)
      episode.remove()

      return res.redirect('/admin/episodes')
    } catch (err) {
      next(err)
    }
  }
}

module.exports = new episodeController()
