const express = require('express')
const router = express.Router()
const passport = require('passport')

// Controllers
const loginController = require('../http/controllers/auth/loginController')
const registerController = require('../http/controllers/auth/registerController')

// validators
const registerValidator = require('../http/validators/registerValidator')
const loginValidator = require('../http/validators/loginValidator')

// Home Routes
router.get('/login', loginController.showLoginForm)
router.post('/login', loginValidator.handle(), loginController.loginProccess)

router.get('/register', registerController.showRegsitrationForm)
router.post(
  '/register',
  registerValidator.handle(),
  registerController.registerProccess
)

module.exports = router
