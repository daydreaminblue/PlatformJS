const express = require('express')
const router = express.Router()

// Controllers
const homeController = require('app/http/controllers/homeController')
const courseController = require('app/http/controllers/courseController')

router.get('/logout', (req, res) => {
  req.logout()
  res.redirect('/')
})

// Home Routes
router.get('/', homeController.index)
router.get('/courses', courseController.index)
router.get('/courses/:course', courseController.single)

// Home Routes
router.get('/', homeController.index)

module.exports = router
