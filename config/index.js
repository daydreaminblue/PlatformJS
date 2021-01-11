const database = require('./database');
const session = require('./session');
const layout = require('./layout');

module.exports = {
    database,
    session,
    layout,
    port : 3000,
    cookie_secretkey :' mysecretkey',
    debug : true
}
