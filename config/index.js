const database = require('./database');
const session = require('./session');

module.exports = {
    database,
    session,
    port : process.env.APPLICATION_PORT,
    cookie_secretkey : process.env.COOKIE_SECRETKEY,
    debug : true
}