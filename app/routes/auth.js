const express = require('express')
const router = express.Router()
const passport = require('passport')

// Controllers
const registerController = require('../http/controllers/auth/registerController')

// Home Routes

router.get('/register', registerController.showRegsitrationForm)
router.post('/register', registerController.register)

module.exports = router
