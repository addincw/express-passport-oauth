const mongoose = require('mongoose')

module.exports = mongoose.model('Post', mongoose.Schema({
    title: { type: String, required: true },
    body: { type: String, required: true },
    status: { 
        type: String,
        default: 'public',
        enum: ['public', 'private'],
    },
    user: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' 
    },
    created_at: { type: Date, default: Date.now }
}))