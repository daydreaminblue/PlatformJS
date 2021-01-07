const express = require('express')
const router = express.Router()

// Controllers
const adminController = require('app/http/controllers/admin/adminController')
const homeController = require('app/http/controllers/homeController')
const courseController = require('app/http/controllers/admin/courseController')
const commentController = require('app/http/controllers/admin/commentController')
const episodeController = require('app/http/controllers/admin/episodeController')
const categoryController = require('app/http/controllers/admin/categoryController')
const teacherController = require('app/http/controllers/admin/teacherController')

// validators
const courseValidator = require('app/http/validators/courseValidator')
const episodeValidator = require('app/http/validators/episodeValidator')
const categoryValidator = require('app/http/validators/categoryValidator')
const videoValidator = require('app/http/validators/videoValidator')

// Helpers
const uploadImage = require('app/helpers/uploadImage')
const uploadVideo = require('app/helpers/uploadVideo')

// Middlewares
const convertFileToField = require('app/http/middleware/convertFileToField')

router.use((req, res, next) => {
  res.locals.layout = 'admin/master'
  next()
})

// Admin Routes
router.get('/', adminController.index)
router.get('/admin-report', adminController.report)
router.get('/teacher-report', teacherController.report)

//Admin Watch orders
router.get('/orders', adminController.showOrderList)
router.delete('/orders/:id', homeController.orderDestroy)

// Course Routes
router.get('/courses', courseController.index)
router.get('/courses/:id/episodes', courseController.courseEpisodes)
router.get('/courses/create', courseController.create)
router.post(
  '/courses/create',
  uploadImage.single('images'),
  convertFileToField.handleImages,
  courseValidator.handle(),
  courseController.store
)
router.get('/courses/:id/create/video', courseController.createVideo)
router.post(
  '/courses/:id/create/video',
  uploadVideo.single('video'),
  convertFileToField.handleVideo,
  videoValidator.handle(),
  courseController.storeVideo
)
router.get('/courses/:id/edit/video', courseController.editVideo)
router.put(
  '/courses/:id/edit/video',
  uploadVideo.single('video'),
  convertFileToField.handleVideo,
  videoValidator.handle(),
  courseController.storeVideo
)

router.get('/courses/:id/edit', courseController.edit)
router.put(
  '/courses/:id',
  uploadImage.single('images'),
  convertFileToField.handleImages,
  courseValidator.handle(),
  courseController.update
)
router.delete('/courses/:id', courseController.destroy)

// Episode Routes
router.get('/episodes', episodeController.index)
router.get('/episodes/create', episodeController.create)
router.get('/episodes/create/:courseId', episodeController.create)
router.post(
  '/episodes/create',
  uploadVideo.single('video'),
  convertFileToField.handleVideo,
  episodeValidator.handle(),
  episodeController.store
)
router.get('/episodes/:id/edit', episodeController.edit)
router.put(
  '/episodes/:id',
  uploadVideo.single('video'),
  convertFileToField.handleVideo,
  episodeValidator.handle(),
  episodeController.update
)
router.delete('/episodes/:id', episodeController.destroy)

// Category Routes
router.get('/categories', categoryController.index)
router.get('/categories/create', categoryController.create)
router.post(
  '/categories/create',
  categoryValidator.handle(),
  categoryController.store
)
router.get('/categories/:id/edit', categoryController.edit)
router.put(
  '/categories/:id',
  categoryValidator.handle(),
  categoryController.update
)
router.delete('/categories/:id', categoryController.destroy)

router.post(
  '/upload-image',
  uploadImage.single('upload-image'),
  adminController.uploadImage
)
router.post(
  '/upload-video',
  uploadImage.single('upload-video'),
  adminController.uploadImage
)

router.get('/comments', commentController.index)
router.get('/comments/approved', commentController.approved)
router.put('/comments/:id/approved', commentController.update)
router.delete('/comments/:id', commentController.destroy)

router.get('/teachers', teacherController.index)
router.get('/teachers/approved', teacherController.approved)
router.get('/teachers/:id', teacherController.review)
router.put('/teachers/:id/approved', teacherController.approve)
router.put('/teachers/:id/denied', teacherController.deny)


module.exports = router
