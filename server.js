const express = require('express'),
    session = require('express-session'),
    RedisStore = require('connect-redis')(session),
    https = require('https'),
    fs = require('fs'),
    routeIndex = require('./routes/index'),
    routeAuth = require('./routes/auth'),
    routeGame = require('./routes/game');

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
        maxAge: 60000 * 60
    },
}));


app.use(express.urlencoded({
    extended: true
}));

app.set('view engine', 'ejs');
app.set('views', './public');

app.use(express.static(__dirname + '/public'));

app.use(function (err, req, res, next) {
    if (err.code !== 'EBADCSRFTOKEN') {
        return next(err);
    }
    console.log(err);
    res.redirect('/');
});

app.use(routeIndex);
app.use(routeAuth);
app.use(routeGame);

server.listen(3000);
// app.listen(3000);