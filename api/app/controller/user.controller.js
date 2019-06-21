const userModel = require('../models/user.model.js');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var config = require('config.json');

exports.authenticate = (req, res) => {
    var user = req.body;
    userModel.findOne({ email: user.email }).then(data => {
        if (data && comparesync(user.password, data.password)) {
            var id = Math.random(1000) + "$" + data.privateKey + "$" + Math.random(10000000) + "$" + data.role;

            var token = jwt.sign({ id: id }, config.secret, {
                expiresIn: 10800
            });

            user = {
                id: data._id,
                ID: data.ID,
                token: token,
                role: data.role,
                account_address: data.account_address
            };

            res.send(user)
        }
        else {
            res.status(200).send({
                message: "Incorrect User id or Password."
            });
        }
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occured during authentication."
        })
    })
}

exports.create = (req, res) => {
    var user = req.body;
    if (!user.email || !user.password) {
        return res.status(200).send({
            message: "Email and Password can not be empty"
        });
    }
    userModel.findOne({ email: user.email }).then(result => {
        if (result) {
            return res.status(200).send({
                message: "Email already registered"
            });
        }
        else {
            const UserModel = new userModel({
                ID: user.ID,
                role: user.role,
                email: user.email,
                password: bcrypt.hashSync(user.password, 10),
                privateKey: user.privateKey,
                accountAddress: user.accountAddress
            });

            // Save User in the database
            return UserModel.save().then(data => {
                res.send(data);
            }).catch(err => {
                res.status(500).send({
                    message: err.message || "Some error occurred while creating the User."
                });
            });

        }
    });

};

exports.isLogin = (req, res) => {
    console.log(req);
    console.log(req.privateKey);
    res.status(200).send(true);
};