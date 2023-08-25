const express = require('express')
const http = require('http')
const passport = require('passport')
const session = require('express-session')
const cors = require('cors')
const socketio = require('socket.io')
const { Strategy: TwitterStrategy } = require('passport-twitter')
const env = require("dotenv");
env.config();

// Private api keys that you will get when registering an app on 
// apps.twitter.com
const TWITTER_CONFIG = {
  consumerKey: process.env.TWITTER_KEY,
  consumerSecret: process.env.TWITTER_SECRET,
  // make sure the call back url matches what was set on Twitter
  // when registering the app
  // callbackURL: 'https://twitter-tg-auth-server.onrender.com/twitter/callback'
  // callbackURL: 'http://127.0.0.1:8080/twitter/callback'
  callbackURL: process.env.CALLBACK_URL
}

// Create the server and allow express and sockets to run on the same port
const app = express()
const server = http.createServer(app)
const io = socketio(server)

// Allows the application to accept JSON and use passport
app.use(express.json())
app.use(passport.initialize())

// Set up cors to allow us to accept requests from our client
app.use(cors({
  origin: process.env.CLIENT_ORIGIN
  // origin: 'http://localhost:3000'
  // origin: 'https://main--celadon-dolphin-c51d55.netlify.app'
})) 

// saveUninitialized: true allows us to attach the socket id
// to the session before we have authenticated with Twitter  
app.use(session({ 
  secret: 'KeyboardKittens', 
  resave: true, 
  saveUninitialized: true 
}))

// allows us to save the user into the session
passport.serializeUser((user, cb) => cb(null, user))
passport.deserializeUser((obj, cb) => cb(null, obj))

console.log({TWITTER_CONFIG})
// Basic setup with passport and Twitter
passport.use(new TwitterStrategy(
  TWITTER_CONFIG, 
  (accessToken, refreshToken, profile, cb) => {
    // console.log({accessToken, refreshToken, profile})
    // save the user right here to a database if you want
    const user = { 
        name: profile.username,
        photo: profile.photos[0].value.replace(/_normal/, '')
    }
    cb(null, user)
  })
)

// Middleware that triggers the PassportJs authentication process
const twitterAuth = passport.authenticate('twitter')

// This custom middleware picks off the socket id (that was put on req.query)
// and stores it in the session so we can send back the right info to the 
// right socket
const addSocketIdToSession = (req, res, next) => {
  req.session.socketId = req.query.socketId
  next()
}

// This is endpoint triggered by the popup on the client which starts the whole
// authentication process
app.get('/twitter', addSocketIdToSession, twitterAuth)

// This is the endpoint that Twitter sends the user information to. 
// The twitterAuth middleware attaches the user to req.user and then
// the user info is sent to the client via the socket id that is in the 
// session. 
app.get('/twitter/callback', twitterAuth, (req, res) => {
  console.log(req.query)
  console.log(req.user.name)
  io.in(req.session.socketId).emit('user', req.user)
  res.end()
})
server.listen(8080, () => {
  console.log('listening...')
})