const express = require('express')
const router = express.Router()

// Controllers
const adminController = require('app/http/controllers/admin/adminController')
const courseController = require('app/http/controllers/admin/courseController')

// validators
const courseValidator = require('app/http/validators/courseValidator')

router.use((req, res, next) => {
  res.locals.layout = 'admin/master'
  next()
})

// Admin Routes
router.get('/', adminController.index)

// Course Routes
router.get('/courses', courseController.index)
router.get('/courses/create', courseController.create)
router.post('/courses/create', courseValidator.handle(), courseController.store)
router.get('/courses/:id/edit', courseController.edit)
router.put('/courses/:id', courseValidator.handle(), courseController.update)
router.delete('/courses/:id', courseController.destroy)

module.exports = router
