const express = require('express')
const router = express.Router()
const passport = require('passport')
//middlewares
const isAuthenticated = require('../middlewares/isAuthenticated')
//models
const Post = require('../models/Post')

router.get('/create', isAuthenticated, (request, response) => {
    response.render('post/create')
})

router.post('/', isAuthenticated, async (request, response) => {
    const data = request.body
    let errors = {}

    for (var key in data) {
        if(!data[key]) errors[key] = `${key} cannot empty`
    }

    if(Object.keys(errors).length !== 0) {
        response.render('post/create', { errors, data })
        return
    }

    try {
        const post = new Post({
            title: data.title,
            body: data.body,
            status: data.status,
            user: request.user.id
        })

        const result = await post.save()

        request.flash('notification', {
            type: 'success',
            message: 'Your post has added'
        })

        response.redirect('/')
    } catch (error) {
        console.log(error)
        response.render('errors/500')
        return
    }
})

module.exports = router