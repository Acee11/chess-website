const express = require('express'),
    csrf = require('csurf');

const router = express.Router();
const csrfProtection = csrf({ cookie: false });

router.get('/game', csrfProtection, (req, res) => {
    if(!req.session.user) {
        res.redirect('/');
        return;
    }
    res.render('game', {
        userName: req.session.user.username,
        csrfToken: req.csrfToken(),
    });
});

module.exports = router;