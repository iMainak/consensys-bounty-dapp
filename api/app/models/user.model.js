const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    id: String,
    role: String,
    email: String,
    password: String,
    private_key: String,
    account_address: String
}, {
    timestamps: true
})

module.exports = mongoose.model('Users', UserSchema)