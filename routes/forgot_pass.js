const express = require('express'),
    csrf = require('csurf');

const router = express.Router();
const csrfProtection = csrf({ cookie: false });



router.get('/forgot-password', csrfProtection, (req, res) => {
    res.render('forgot_pass', {
        csrfToken: req.csrfToken(),
    });
});

module.exports = router;