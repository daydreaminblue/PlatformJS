const express = require('express')
const router = express.Router()

// Middlewares
const redirectIfAuthenticated = require('../http/middleware/redirectIfAuthenticated')
const errorHandler = require('../http/middleware/errorHandler')

// Auth Router
const authRouter = require('./auth')
router.use('/auth', redirectIfAuthenticated.handle, authRouter)

// Handle Errors
router.all('*', errorHandler.error404)
router.use(errorHandler.handler)

module.exports = router
