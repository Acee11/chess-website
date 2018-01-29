const express = require('express'),
    csrf = require('csurf');

const router = express.Router();

router.get('/', (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
});


router.get('/', (req, res) => {
    res.render('index');
});

module.exports = router;