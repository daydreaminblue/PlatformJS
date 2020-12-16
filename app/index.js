const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const validator = require('express-validator');
const session = require('express-session');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const passport = require('passport');
const Helpers = require('./helpers');
const config = require('./../config');
const methodOverride = require('method-override');


module.exports = class Application {
    constructor() {
        this.setupExpress();
        this.setMongoConnection();
        this.setConfig();
        this.setRouters();
    }

    
    setupExpress() {
        const server = http.createServer(app);
        server.listen(3000 , () => console.log(`Listening on port ${3000}`));
    }

    setMongoConnection() {
        mongoose.Promise = global.Promise;
        mongoose.set('useNewUrlParser', true)
        mongoose.set('useUnifiedTopology', true)
        mongoose.set('useCreateIndex', true)
        mongoose.set('useFindAndModify', false)
        mongoose.connect('mongodb://localhost/platformr');
    }

    setConfig() {
        require('app/passport/passport-local');
 
        app.use(express.static(config.layout.public_dir));
        app.set('view engine', config.layout.view_engine);
        app.set('views' , config.layout.view_dir);
        app.use(config.layout.ejs.expressLayouts);
        app.set("layout extractScripts", config.layout.ejs.extractScripts);
        app.set("layout extractStyles", config.layout.ejs.extractStyles);
        app.set("layout" , config.layout.ejs.master);


        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended : true }));
        app.use(methodOverride('_method'));
        app.use(validator());
        app.use(cookieParser());
        app.use(session({ secret: '123' }));
        app.use(flash());
        app.use(passport.initialize());
        app.use(passport.session());

        app.use((req , res , next) => {
            app.locals = new Helpers(req, res).getObjects();
            next();
        });
    }

    setRouters() {
        app.use(require('app/routes/api'));
        app.use(require('app/routes/web'));        
    }
}