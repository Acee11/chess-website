const express = require('express'),
    csrf = require('csurf'),
    flash = require('connect-flash'),
    validator = require('validator');

const router = express.Router();
const csrfProtection = csrf({ cookie: false });

router.get('/anonymous', csrfProtection, (req, res) => {
    try {
        res.render('anonymous', {
            csrfToken: req.csrfToken(),
            errMsg: req.flash('errMsg'),
        });
    } catch (error) {
        console.log(error);
        req.flash('errMasg', 'Error, please try again');
        res.redirect('/anonymous');
    }
});

router.post('/anonymous', csrfProtection, (req, res, next) => {
    try {
        let errMsg = '';
        if (!req.body.gs_username) {
            errMsg = 'Please enter your name';
        } else if (!validator.isAlphanumeric(req.body.gs_username)) {
            errMsg = 'Wrong type of input';
        } else if (req.body.gs_username.length < 3) {
            errMsg = 'Username should be at least 3 characters long';
        } else if (req.body.gs_username.length > 20) {
            errMsg = 'Username should be at most 20 characters long';
        }

        if(errMsg) {
            req.flash('errMsg', errMsg);
            res.redirect('/anonymous');
            return;
        }

        next();
    } catch (error) {
        console.log(error);
        req.flash('errMasg', 'Error, please try again');
        res.redirect('/anonymous');
    }
});

router.post('/anonymous', csrfProtection, (req, res) => {
    try {
        req.session.user = {
            guest: true,
            username: req.body.username,
        };
    
        res.redirect('/');
    } catch (error) {
        console.log(error);
        req.flash('errMasg', 'Error, please try again');
        res.redirect('/anonymous');
    }
})

module.exports = router;