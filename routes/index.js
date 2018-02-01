const express = require('express');

const router = express.Router();

router.get('/', (req, res, next) => {
    if (req.session.user) {
        res.redirect('/game');;
    } else {
        res.redirect('/auth');
    }
});

module.exports = router;