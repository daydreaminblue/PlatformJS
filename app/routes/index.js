const express = require('express')
const router = express.Router()

// Auth Router
const authRouter = require('./auth')
router.use('/auth', redirectIfAuthenticated.handle, authRouter)

// Handle Errors
router.all('*', errorHandler.error404)
router.use(errorHandler.handler)

module.exports = router
