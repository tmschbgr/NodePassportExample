// Dependencies
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors')
var passport = require('passport');
var SamlStrategy = require('passport-saml').Strategy;
var session = require('express-session');
require('dotenv').config();

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('./public'));

app.use(session({ secret: "asdasdasdadasdasd" }));
app.use(passport.initialize());
app.use(passport.session());

// Allow Cors
app.use(cors())

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Configuration of SAML Stragegy
passport.use(new SamlStrategy(
    {
        path: '/login/callback',
        entryPoint: process.env.PASSPORT_ENTRYPOINT,
        issuer: process.env.PASSPORT_ISSUER
    },
    (profile, done) => done(null, {
        authlevel: profile['http://schemas.pwc.com/identity/claims/authlevel'],
        nameidentifier: profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
        pwcguid: profile['http://schemas.pwc.com/identity/claims/pwcguid'],
        pwcusertype: profile['http://schemas.pwc.com/identity/claims/pwcusertype'],
        country: profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/country'],
        email: profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
        givenname: profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'],
        name: profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
        surname: profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname']
    })
));

// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Credentials', true);
//     res.header('Access-Control-Allow-Origin', req.headers.origin);
//     res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
//     res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

//     // intercept OPTIONS method
//     if ('OPTIONS' == req.method) 
//         res.send(200);
//     else 
//         next();
// })

// Login callback. This has to match the path in the SAML Strategy
app.post('/login/callback',
    passport.authenticate('saml', { failureRedirect: '/', failureFlash: true }),
    (req, res) => res.redirect('/')
);

// Login route. Call this route to trigger the login process
app.get('/login',
    (req, res, next) => { console.log(req.headers); next(); },                                      // Console.log headers
    (req, res, next) => { delete req['x-requested-with']; delete req['referer']; next() },          // Delete some headers
    (req, res, next) => { console.log(req.headers); next(); },                                      // Console.log headers
    passport.authenticate('saml', { failureRedirect: '/fail', failureFlash: true }),
    (req, res) => res.redirect('/api/test')
);

app.get('/api/test',
    checkAuthentication,
    (req, res) => res.send('helloWorld')
);

app.get('/api/request', (req, res) => {
    res.json(req.headers)
})

function checkAuthentication(req, res, next) {
    if (req.isAuthenticated())
        next();
    else
        res.redirect("/login");
}

// Start Server
app.listen(3000);
console.log('API is running on port 3000');


