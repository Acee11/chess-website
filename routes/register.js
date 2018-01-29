const express = require('express'),
    csrf = require('csurf'),
    { Pool } = require('pg'),
    User = require('./../models/user'),
    flash = require('connect-flash'),
    validator = require('validator');

const router = express.Router();
const csrfProtection = csrf({ cookie: false });

const pool = new Pool({
    user: 'weppo',
    password: 'weppo1337',
    host: 'localhost',
    database: 'chess_website',
    port: 5432,
})

router.get('/register', csrfProtection, (req, res) => {
    res.render('register', {
        csrfToken: req.csrfToken(),
        errMsg: req.flash('errMsg'),
    });
});

router.post('/register', csrfProtection, (req, res, next) => {
    try {
        let errMsg = '';
        if (
            !req.body.reg_email 
            || !req.body.reg_password 
            || !req.body.reg_password_confirm
            || !req.body.reg_username
            || !req.body.reg_password
        ) {
            errMsg = 'Please, fill all the fields above';
        } else if (req.body.reg_agree !== 'on') {
            errMsg = 'You need to agree with terms to register'
        } else if (
            !validator.isAlphanumeric(req.body.reg_username)
            || !validator.isAlphanumeric(req.body.reg_password)
            || !validator.isAlphanumeric(req.body.reg_password_confirm)
        ){
            errMsg = 'Wrong type of input'
        } else if(req.body.reg_username.length < 3) {
            errMsg = 'Username should be at least 3 characters long';
        } else if (req.body.reg_username.length > 20) {
            errMsg = 'Username should be at most 20 characters long';
        } else if(!validator.isEmail(req.body.reg_email)) {
            errMsg = 'Please, enter correct email'
        } else if (req.body.reg_password !== req.body.reg_password_confirm) {
            errMsg = 'Passwords do not match';
        } else if (req.body.reg_password.length < 8) {
            errMsg = 'Password should be at least 8 characters long';
        }
    
    
        if (errMsg) {
            req.flash('errMsg', errMsg);
            res.redirect('/register');
            return;
        }
    
        next();
    } catch(error) {
        console.log(error);
        res.redirect('/register');
    }
});

router.post('/register', csrfProtection, async (req, res) => {
    try {
        let user = await User.create({
            username: req.body.reg_username,
            password: req.body.reg_password,
            email: req.body.reg_email,
        });
        req.session.user = user.dataValues;
        res.redirect('/');
    } catch(error) {
        req.flash('errMsg', 'Username or email is already taken');
        res.redirect('/register');
    }


})

module.exports = router;