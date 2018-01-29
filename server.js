const express = require('express'),
    session = require('express-session'),
    RedisStore = require('connect-redis')(session),
    https = require('https'),
    fs = require('fs'),
    flash = require('connect-flash'),
    routeIndex = require('./routes/index.js'),
    routeLogin = require('./routes/login.js'),
    routeRegister = require('./routes/register.js'),
    routeForgotPass =require('./routes/forgot_pass'),
    routeAnonymous = require('./routes/anonymous');

const httpsOptions = {
    pfx: fs.readFileSync('./cert.pfx'),
    passphrase: 's3cr3t'
};

const redisOptions = {
    host: 'localhost',
    port: 6379,
};

const app = express();
const server = https.createServer(httpsOptions, app);

app.use(session({
    store: new RedisStore(redisOptions),
    secret: 's3cr3t',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true,
        maxAge: 60000
    },
}));

app.use(flash());

app.use(express.urlencoded({
    extended: true
}));

app.set('view engine', 'ejs');
app.set('views', './public');

app.use(express.static(__dirname + '/public'));

app.use(routeLogin);
app.use(routeIndex);
app.use(routeRegister);
app.use(routeForgotPass);
app.use(routeAnonymous);

server.listen(3000);
// app.listen(3000);