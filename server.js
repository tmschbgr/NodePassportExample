// Dependencies
var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var SamlStrategy = require('passport-saml').Strategy;
var session = require('express-session');
require('dotenv').config();

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({ secret: "THISISMYSUPERSECURESECRETSECRET" }));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Configuration of SAML Strategy
passport.use(new SamlStrategy(
    {
        path: '/login/callback',
        entryPoint: process.env.PASSPORT_ENTRYPOINT,
        issuer: process.env.PASSPORT_ISSUER
    },
    (profile, done) => done(null, {
        guid: profile[process.env.CLAIM_GUID],
        email: profile[process.env.CLAIM_EMAIL],
        name: profile[process.env.CLAIM_NAME],
    })
));


// Login route. Call this route to trigger the login process
app.get('/login', passport.authenticate('saml', { failureRedirect: '/' }), (req, res) => res.redirect('/api/test'));

// Login callback. This has to match the path in the SAML Strategy
app.post('/login/callback', passport.authenticate('saml', { failureRedirect: '/' }), (req, res) => res.redirect('/'));

// Authentication Middleware - Check if request is authenticated, otherwise redirect to login
app.use((req, res, next) => req.isAuthenticated() ? next() : res.redirect('/login'))

// Server Static Files
app.use(express.static('./public'));

// Example Route - Returns the user with the information from the claims
app.get('/api/user', (req, res) => res.send(req.user));

// Start Server
app.listen(3000, () => console.log('API is running on port 3000'));


