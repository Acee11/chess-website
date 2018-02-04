const express = require('express'),
    csrf = require('csurf'),
    routeRoomList = require('./room_list'),
    routeBoard = require('./board'),
    routeCreateRoom = require('./create_room');

const router = express.Router();
const csrfProtection = csrf({ cookie: false });

router.get('/game', csrfProtection, (req, res) => {
    if(!req.session.user) {
        res.redirect('/');
        return;
    }
    res.render('game', {
        userName: req.session.user.username,
        csrfToken: req.csrfToken(),
    });
});

router.use(routeRoomList);
router.use(routeBoard);
router.use(routeCreateRoom);

module.exports = router;