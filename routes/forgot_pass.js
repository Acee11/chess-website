const express = require('express'),
    csrf = require('csurf');

const router = express.Router();
const csrfProtection = csrf({ cookie: false });

router.get('/forgot-password', csrfProtection, (req, res) => {
    try {
        res.render('forgot_pass', {
            csrfToken: req.csrfToken(),
        });
    } catch(error) {
        console.log(error);
        res.redirect('/forgot-password');
    }
});

module.exports = router;