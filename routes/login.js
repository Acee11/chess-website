const express = require('express'),
    csrf = require('csurf'),
    User = require('./../models/user'),
    flash = require('connect-flash');

const router = express.Router();
const csrfProtection = csrf({ cookie: false });

router.get('/login', csrfProtection, (req, res) => {
    try {
        res.render('login', {
            csrfToken: req.csrfToken(),
            errMsg: req.flash('errMsg'),
        });
    } catch(error) {
        console.log(error);
        req.flash('errMsg', 'Error, please try again');
        res.redirect('/login');
        return;
    }
});

router.post('/login', csrfProtection, (req, res, next) => {
    try {
        let errMsg = '';
        if (
            !req.body.lg_username
            || !req.body.lg_password
        ) {
            errMsg = 'Please, fill all the fields above';
        }
    
        if (errMsg) {
            req.flash('errMsg', errMsg);
            res.redirect('/login');
            return;
        }
        
        next();
    } catch(error) {
        console.log(error);
        req.flash('errMsg', 'Error, please try again');
        res.redirect('/login');
    }
});

router.post('/login', csrfProtection, async (req, res) => {
    try {
        let user = await User.findOne({
            where: {
                username: req.body.lg_username
            }
        });
        if (!user) {
            req.flash('errMsg', 'User does not exist');
            res.redirect('/login');
            return;
        }
        let username = req.body.lg_username,
            password = req.body.lg_password;
            
        const isValid = await user.validPassword(password);
        if (!isValid) {
            res.redirect('/login', );
        } else {
            req.session.user = user.dataValues;
            res.redirect('/');
        }
    } catch(error) {
        console.log(error);
        req.flash('errMsg', 'Error, please try again');
        res.redirect('/login');
    }
});

module.exports = router;