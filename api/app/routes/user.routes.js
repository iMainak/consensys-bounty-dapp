module.exports = (app) => {
    const user = require("../controller/user.controller.js")
    app.post('user/authenticate', user.authenticate);
    app.post('user/register', user.create);
    app.post('user/isLogin', user.isLogin);
}