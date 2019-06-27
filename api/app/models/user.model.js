const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    id: String,
    role: String,
    email: String,
    password: String,
    privateKey: String,
    accountAddress: String
}, {
    timestamps: true
})

module.exports = mongoose.model('Users', UserSchema)