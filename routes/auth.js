const express = require('express'),
    csrf = require('csurf'),
    routeLogin = require('./login.js'),
    routeRegister = require('./register.js'),
    routeForgotPass = require('./forgot_pass'),
    routeAnonymous = require('./anonymous'),
    routeLogout = require('./logout');

const router = express.Router();
const csrfProtection = csrf({ cookie: false });

router.use(routeLogin);
router.use(routeRegister);
router.use(routeForgotPass);
router.use(routeAnonymous);
router.use(routeLogout);

router.get('/auth', (req, res, next) => {
    if(req.session.user) {
        res.redirect('/game');
    } else {
        next();
    }
});
router.get('/auth', csrfProtection, (req, res) => {
    res.render('auth', {
        csrfToken: req.csrfToken(),
    });
});

module.exports = router;