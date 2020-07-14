const mongoose = require('mongoose')
const { Schema } = require('mongoose')

const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    user_name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String, 
        required: true
    },
    admin: {
        type: Boolean,
        default: false
    }, 
    assigned_team: {
        type: String,
        trim: true,
        default: undefined
    }
})

const User = mongoose.model('User', UserSchema)
module.exports = User