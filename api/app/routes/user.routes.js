module.exports = (app) => {
    const users = require("../controller/user.controller.js")
    app.post('/users/authenticate', users.authenticate);
    app.post('/users/isLogin', users.isLogin);
}