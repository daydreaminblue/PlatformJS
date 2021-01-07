const express = require('express')
const router = express.Router()

// Controllers
const homeController = require('app/http/controllers/homeController')
const courseController = require('app/http/controllers/courseController')
const categoryController = require('app/http/controllers/categoryController')
const teacherController = require('app/http/controllers/admin/teacherController')
//validator
const commentValidator = require('app/http/validators/commentValidator')
const teacherValidator = require('app/http/validators/teacherValidator')

// middlewares
const redirectIfNotAuthenticated = require('app/http/middleware/redirectIfNotAuthenticated')
const convertFileToField = require('app/http/middleware/convertFileToField')

// Helpers
const uploadResume = require('app/helpers/uploadResume')

// Home Routes
router.get('/', homeController.index)
router.get('/logout', (req, res) => {
  req.logout()
  res.redirect('/')
})
router.get('/about-us', homeController.about)
router.get('/search', homeController.search)
router.get('/allcourses', homeController.allCourses)
router.get('/mostViewedCourses', homeController.mostViewedCourses)
//show category
router.get('/categories/:category', categoryController.index)
//panel
router.get('/panel', homeController.panel)
//show cart
router.get('/cart', homeController.showCart)
router.delete('/cart/:id', homeController.orderDestroy)
//like
router.post('/courses/:courseId/like', courseController.likeCourse)
router.post(
  '/courses/:courseId/like/destroy',
  courseController.destroyLikeCourse
)
router.get('/likes', homeController.showLikes)
//bookmark
router.post('/courses/:courseId/bookmark', courseController.bookmarkCourse)
router.post(
  '/courses/:courseId/bookmark/destroy',
  courseController.destroyBookmarkCourse
)
router.get('/bookmarks', homeController.showBookmarks)
//payment
/*
router.post(
  '/payment/:orderId/:courseId',
  redirectIfNotAuthenticated.handle,
  courseController.payment
)
router.get(
  '/payment/checker',
  redirectIfNotAuthenticated.handle,
  courseController.checker
)
*/
//single course
router.get('/courses/:course', courseController.single)
router.get('/courses/:course/:episode', courseController.single)
router.post('/courses/:courseId', courseController.orderCourse)
//comments
router.get('/showComments', homeController.showComments)
router.post(
  '/comment',
  redirectIfNotAuthenticated.handle,
  commentValidator.handle(),
  courseController.comment
)
//teacher
router.get(
  '/teacher',
  redirectIfNotAuthenticated.handle,
  teacherController.teacherPage
)
router.post(
  '/teacher/:id',
  redirectIfNotAuthenticated.handle,
  uploadResume.single('resume'),
  convertFileToField.handleResume,
  teacherValidator.handle(),
  teacherController.teacherReq
)

module.exports = router
