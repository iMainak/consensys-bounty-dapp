require('rootpath')();
var express = require('express')
var app = express()
var cors = require('cors')
var bodyParser = require('body-parser')
var expressJwt = require('express-jwt')
var config = require('./config.json')
var jwt = require('jsonwebtoken')
var fileUpload = require('express-fileupload')

app.use(cors());
app.use(fileUpload());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 1000000 }));
app.use(bodyParser.json());
app.use('/uploads', express.static(__dirname + "/uploads"));
// Web Token Setup
app.use(expressJwt({
    secret: config.secret,
    getToken: function (req) {
        var token = null;
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            req.privateKey = 'value of private key fill it from token';
            token = req.headers.authorization.split(' ')[1];
        } else if (req.query && req.query.token) {
            token = req.query.token;
        }

        jwt.verify(token, config.secret, function (err, decoded) {
            if (err) {
                token = null;
            } else {
                req.privateKey = decoded.id.split('$')[1];
                req.userRole = decoded.id.split('$')[3];
            }
        });
        return token;
    }
}).unless({
    path: ['/users/authenticate',
        '/users/register',
        '/bounty/registerPublisher',
        '/bounty/registerApplier',
        // '/bounty/addBounty',
        // '/bounty/addAnswerForBounty',
        // '/bounty/addBountyToApplier',
        '/bounty/getBalance',
        // '/bounty/deposit',
        '/bounty/getPublisherDetails',
        '/bounty/getApplierDetails',
        '/bounty/getAllBountys',
        '/bounty/getBountysDetails',
        // '/bounty/getBountyAnswerDetails',
    ]
}))

// Data Base Connection
const mongoose = require('mongoose')
mongoose.Promise = global.Promise;
mongoose.connect(config.connectionString, { useNewUrlParser: true }).then(() => {
    console.log("Successfully Connected to the database")
}).catch(err => {
    console.log("Could not connect to the data base" + err)
    process.exit();
})
// Routes
require('./app/routes/user.routes.js')(app);
require('./app/routes/control.routes.js')(app);

var port = process.env.NODE_ENV === 'production' ? 80 : 5012;
var server = app.listen(port, function () {
    console.log('Server listening on port ' + port);
});