const express = require('express')
const router = express.Router()
const passport = require('passport')

const isGuest = require('../middlewares/isGuest')

router.get('/login', isGuest, (request, response) => response.render('login', { 'layout': 'layouts/guest.ejs' }))
router.get('/github', isGuest, passport.authenticate('github'))

router.get('/github/callback', isGuest, (request, response, next) => {
    passport.authenticate('github', { 
        successRedirect: '/',
        failureRedirect: '/auth/login',
        failureFlash: true 
    })(request, response, next)
})

router.get('/logout', (request, response) => {
    request.logout()
    request.flash('notification', {
        type: 'success',
        message: 'You are logout.'
    })

    response.redirect('/auth/login')
})

module.exports = router