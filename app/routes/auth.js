const express = require('express')
const router = express.Router()
const passport = require('passport')

// Controllers
const loginController = require('../http/controllers/auth/loginController')
const registerController = require('../http/controllers/auth/registerController')

// Home Routes
router.get('/login', loginController.showLoginForm)
router.post('/login', loginController.login)

router.get('/register', registerController.showRegsitrationForm)
router.post('/register', registerController.register)

module.exports = router
