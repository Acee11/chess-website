const express = require('express'),
    csrf = require('csurf'),
    flash = require('connect-flash'),
    validator = require('validator');

const router = express.Router();
const csrfProtection = csrf({ cookie: false });

router.get('/anonymous', csrfProtection, (req, res) => {
    res.render('anonymous', {
        csrfToken: req.csrfToken(),
    });
});

router.post('/anonymous', csrfProtection, (req, res, next) => {
    let msg = '';
    try {
        if (!req.body.gs_username) {
            msg = 'Please enter your name';
        } else if (!validator.isAlphanumeric(req.body.gs_username)) {
            msg = 'Wrong type of input';
        } else if (req.body.gs_username.length < 3) {
            msg = 'Username should be at least 3 characters long';
        } else if (req.body.gs_username.length > 20) {
            msg = 'Username should be at most 20 characters long';
        }
    } catch (error) {
        msg = 'Error, please try again';
    } finally {
        if (msg) {
            res.json({
                err: true,
                msg: msg,
            });
        } else {
            next();
        }
    }
});

router.post('/anonymous', (req, res) => {
    try {
        req.session.user = {
            guest: true,
            username: req.body.gs_username,
        };
    
        res.json({
            err: false,
        });
    } catch (error) {
        res.json({
            err: true,
            msg: 'Error, please try again'
        });
    }
});

module.exports = router;