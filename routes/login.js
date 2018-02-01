const express = require('express'),
    csrf = require('csurf'),
    User = require('./../models/user'),
    flash = require('connect-flash');

const router = express.Router();
const csrfProtection = csrf({ cookie: false });


router.get('/login', csrfProtection, (req, res) => {
    res.render('login', {
        csrfToken: req.csrfToken(),
    });
});

router.post('/login', csrfProtection, (req, res, next) => {
    let msg = '';
    try {
        if (
            !req.body.lg_username
            || !req.body.lg_password
        ) {
            msg = 'Please, fill all the fields above';
        }
    } catch(error) {
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

router.post('/login', async (req, res, next) => {
    try {
        let user = await User.findOne({
            where: {
                username: req.body.lg_username
            }
        });
        if (!user) {
            next();
            return;
        } 
        let username = req.body.lg_username,
            password = req.body.lg_password;
        
        if (!await user.validPassword(password)) {
            next();
            return;
        } 
        req.session.user = user.dataValues;
        res.json({
            err: false,
        })
    } catch(error) {
        res.json({
            err: true,
            msg: 'Error, please try again',
        });
    }
});

router.post('/login', async (req, res) => {
    res.json({
        err: true,
        msg: 'Wrong username/password',
    });
});

module.exports = router;