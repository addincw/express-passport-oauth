const mongoose = require('mongoose')

module.exports = mongoose.model('User', mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String },
    password: { type: String, required: true },
    github: { type: Object }
}))