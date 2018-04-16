const express = require('express'),
    csrf = require('csurf');

const router = express.Router();
const csrfProtection = csrf({ cookie: false });

router.use((req, res, next) => {
    if (!req.session.user) {
        res.redirect('/');
    } else {
        next();
    }
});

router.get('/game', csrfProtection, (req, res) => {
    res.render('game', {
        userName: req.session.user.username,
        csrfToken: req.csrfToken(),
    });
});



module.exports = router;