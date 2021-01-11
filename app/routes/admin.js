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

// Course Routes
router.get('/courses', courseController.index)
router.get('/courses/:courseId/episodes', courseController.courseEpisodes)
router.get('/courses/create', courseController.create)
router.post(
  '/courses/create',
  uploadImage.single('images'),
  convertFileToField.handleImages,
  courseValidator.handle(),
  courseController.store
)
router.get('/courses/:courseId/edit', courseController.edit)
router.put(
  '/courses/:courseId',
  uploadImage.single('images'),
  convertFileToField.handleImages,
  courseValidator.handle(),
  courseController.update
)
router.delete('/courses/:courseId', courseController.destroy)
router.get('/courses/:courseId/create/video', courseController.createVideo)
router.post(
  '/courses/:courseId/create/video',
  uploadVideo.single('video'),
  convertFileToField.handleVideo,
  videoValidator.handle(),
  courseController.storeVideo
)
router.get('/courses/:courseId/edit/video', courseController.editVideo)
router.put(
  '/courses/:courseId/edit/video',
  uploadVideo.single('video'),
  convertFileToField.handleVideo,
  videoValidator.handle(),
  courseController.storeVideo
)

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
router.get('/episodes/:episodeId/edit', episodeController.edit)
router.put(
  '/episodes/:episodeId',
  uploadVideo.single('video'),
  convertFileToField.handleVideo,
  episodeValidator.handle(),
  episodeController.update
)
router.delete('/episodes/:episodeId', episodeController.destroy)

// Category Routes
router.get('/categories', categoryController.index)
router.get(
  '/categories/:categorySlug/:categoryId/courses',
  categoryController.categoryCourses
)
router.get('/categories/create', categoryController.create)
router.post(
  '/categories/create',
  categoryValidator.handle(),
  categoryController.store
)
router.get('/categories/:categoryId/edit', categoryController.edit)
router.put(
  '/categories/:categoryId',
  categoryValidator.handle(),
  categoryController.update
)
router.delete('/categories/:categoryId', categoryController.destroy)

//Comment Routes
router.get('/comments', commentController.index)
router.get('/comments/approved', commentController.approved)
router.put('/comments/:commentId/approved', commentController.update)
router.delete('/comments/:commentId', commentController.destroy)

//Teacher Routes
router.get('/teachers', teacherController.index)
router.get('/teachers/approved', teacherController.approved)
router.get('/teachers/:teacherId', teacherController.review)
router.put('/teachers/:teacherId/approved', teacherController.approve)
router.put('/teachers/:teacherId/denied', teacherController.deny)

module.exports = router
