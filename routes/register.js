const express = require('express'),
    csrf = require('csurf'),
    { Pool } = require('pg'),
    User = require('./../models/user'),
    validator = require('validator');

const router = express.Router();
const csrfProtection = csrf({ cookie: false });


router.get('/register', csrfProtection, (req, res) => {
    res.render('register', {
        csrfToken: req.csrfToken(),
    });
});

router.post('/register', csrfProtection, (req, res, next) => {
    let msg = '';
    try {
        if (
            !req.body.reg_email 
            || !req.body.reg_password 
            || !req.body.reg_password_confirm
            || !req.body.reg_username
            || !req.body.reg_password
        ) {
            msg = 'Please, fill all the fields above';
        } else if (req.body.reg_agree !== 'on') {
            msg = 'You need to agree with terms to register'
        } else if (
            !validator.isAlphanumeric(req.body.reg_username)
            || !validator.isAlphanumeric(req.body.reg_password)
            || !validator.isAlphanumeric(req.body.reg_password_confirm)
        ){
            msg = 'Wrong type of input'
        } else if(req.body.reg_username.length < 3) {
            msg = 'Username should be at least 3 characters long';
        } else if (req.body.reg_username.length > 20) {
            msg = 'Username should be at most 20 characters long';
        } else if(!validator.isEmail(req.body.reg_email)) {
            msg = 'Please, enter correct email'
        } else if (req.body.reg_password !== req.body.reg_password_confirm) {
            msg = 'Passwords do not match';
        } else if (req.body.reg_password.length < 8) {
            msg = 'Password should be at least 8 characters long';
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

router.post('/register', async (req, res) => {
    try {
        let user = await User.create({
            username: req.body.reg_username,
            password: req.body.reg_password,
            email: req.body.reg_email,
        });
        req.session.user = user.dataValues;
        res.json({
            err: false,
        });
    } catch(error) {
        res.json({
            err: true,
            msg: 'Username or email is already taken',
        });
    }
})

module.exports = router;