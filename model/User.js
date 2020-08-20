const mongoose = require('mongoose')

const userSchema = mongoose.Schema({

    name: {
        type: String,
        maxlength: 20
    },
    email: {
        type: String,
        maxlength: 30,
        trim: true,
        unique: 1
    },
    password: {
        type: String,
        minlength: 5
    },
    gender: {
        tpye: Number
    },
    role: {
        tpye: Number,
        default: 0
    },
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }

})

const User = mongoose.model('User',userSchema)
module.exports = { User }