const userModel = require('../models/user.model.js');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var config = require('../../config.json');

exports.authenticate = (req, res) => {
    var user = req.body;
    userModel.findOne({ email: user.email }).then(data => {
        if (data && bcrypt.compareSync(user.password, data.password)) {
            var id = Math.random(1000) + "$" + data.privateKey + "$" + Math.random(10000000) + "$" + data.role;

            var token = jwt.sign({ id: id }, config.secret, {
                expiresIn: 10800
            });
            user = {
                id: data.id,
                token: token,
                role: data.role,
                accountAddress: data.accountAddress
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

exports.create = (user) => {
    return new Promise((resolve, reject) => {
        if(!user.email || !user.password) {
            reject("Email and Password can not be empty");
        }
        userModel.findOne({email: user.email}).then(result=>{
            if(result)
            {
                reject("Email already registered");
            }
            else{
                const UserModel = new userModel({
                    id: user.id,
                    role: user.role,
                    email: user.email,
                    password: bcrypt.hashSync(user.password, 10),
                    privateKey: user.privateKey,
                    accountAddress: user.accountAddress      
                });
                // Save User in the database
                UserModel.save().then(data => {
                    console.log("saved data in mongo");
                    resolve(data);
                }).catch(err => {
                    reject(err.message || "Some error occurred while creating the User.");
                });
    
            }
        }); 
    });
};


                