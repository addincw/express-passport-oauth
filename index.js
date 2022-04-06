require('dotenv').config()

const mongoose = require('mongoose')
const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const session = require('express-session')
const SessionStore = require('connect-mongo')(session)
const flash = require('connect-flash')
const passport = require('passport')
const GitHubStrategy = require('passport-github').Strategy;

const hash = require('./helpers/hash')

const isAuthenticated = require('./middlewares/isAuthenticated')

const User = require('./models/User')
const Post = require('./models/Post')

//create connection to DB
mongoose.connect(process.env.DB_CONNECTION, { 
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        .then(console.log('Success connect to DB'))
        .catch((err) => console.log('failed connect to DB: ' + err))

const app = express()

//handle request.body
app.use(express.urlencoded({ extended: false }))

//using flash to implement flash message (need express session)
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    store: new SessionStore({ mongooseConnection: mongoose.connection })
}))
app.use(flash())
app.use((request, response, next) => {
    const [error] = request.flash('error')
    let [notification] = request.flash('notification')

    if(error) {
        notification = {
            type: 'danger',
            message: error
        }
    }

    response.locals.notification = notification
    next()
})

//passport Github strategy
passport.use(new GitHubStrategy(
    {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/github/callback"
    },
    async function(accessToken, refreshToken, profile, done) {
        try {
            const userAttribute = {
                name: profile.username,
                email: profile._json.email,
                password: hash.make(profile.username),
                github: {
                    id: profile.id,
                    access_token: accessToken,
                    refresh_token: refreshToken
                }
            }

            let user = await User.findOneAndUpdate(
                { 'github.id': profile.id },
                userAttribute,
                { useFindAndModify: false, returnOriginal: false }
            )

            if(!user) {
                newUser = new User(userAttribute)
                user = await newUser.save()
            }
            
            return done(null, user)
        } catch (error) {
            return done(error)
        }
    }
))
passport.serializeUser((user, done) => done(null, user.id))  
passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => done(err, user))
})

app.use(passport.initialize())
app.use(passport.session())

//set template engine
app.use(expressLayouts)
app.set('view engine', 'ejs')
app.set('layout', 'layouts/authenticated.ejs')

//set routes
app.use('/auth', require('./routes/auth'))
app.use('/posts', require('./routes/posts'))

app.get('/', isAuthenticated, async (request, response) => {
    try {
        const posts = await Post.find({ user: request.user.id }).populate('user')
        response.render('index', { posts })
    } catch (error) {
        response.render('errors/500', { 'layout': 'layouts/guest.ejs' })
    }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server running on port : ${PORT}`))