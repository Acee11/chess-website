const express = require('express'),
    session = require('express-session'),
    RedisStore = require('connect-redis')(session),
    https = require('https'),
    fs = require('fs')

const httpsOptions = {
    pfx: fs.readFileSync('./cert.pfx'),
    passphrase: 's3cr3t'
};

const redisOptions = {
    host: 'localhost',
    port: 6379,
};

let app = express();
let server = https.createServer(httpsOptions, app)

app.use(session({
    store: new RedisStore(redisOptions),
    secret: 's3cr3t',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true,
    },
}));

app.use(express.urlencoded({
    extended: true
}));

app.set('view engine', 'ejs');
app.set('views', './views');

app.get('/', (req, res) => {
    let username = 'World';
    if(req.session && req.session.username) {
        username = req.session.username;
    }
    res.render('index', {
        username: username,
    });
})

app.post('/', (req, res) => {
    req.session.username = req.body.username;
    console.log(req.body);
    res.redirect('/')
});



server.listen(3000);