const express = require('express'),
    csrf = require('csurf'),
    session = require('express-session');

const router = express.Router();
const csrfProtection = csrf({ cookie: false });


router.post('/logout', csrfProtection, (req, res) => {
    req.session.destroy((err) => {
        if(err) {
            res.json({
                err: true,
                msg: "??",
            });
        } else {
            res.json({
                err: false,
            });
        }
    });
});

module.exports = router;