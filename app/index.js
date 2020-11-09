const express = require('express')
const app = express()
const http = require('http')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const validator = require('express-validator')
const session = require('express-session')
const mongoose = require('mongoose')
const flash = require('connect-flash')
const passport = require('passport')
const methodOverride = require('method-override')
const config = require('../config')

module.exports = class Application {
  constructor() {
    this.setupExpress()
    this.setMongoConnection()
    this.setConfig()
    this.setRouters()
  }

  setupExpress() {
    const server = http.createServer(app)
    server.listen(3000, () => console.log(`Listening on port ${3000}`))
  }

  setMongoConnection() {
    mongoose.Promise = global.Promise
    mongoose.set('useNewUrlParser', true)
    mongoose.set('useUnifiedTopology', true)
    mongoose.set('useCreateIndex', true)
    mongoose.set('useFindAndModify', false)
    mongoose.connect(config.database.url)
  }

  setConfig() {
    require('./passport/passport-local')

    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(methodOverride('_method'))
    app.use(validator())
    app.use(cookieParser())
    app.use(session({ secret: '123' }))
    app.use(flash())
    app.use(passport.initialize())
    app.use(passport.session())
  }

  setRouters() {
    app.use(require('./routes'))
  }
}
