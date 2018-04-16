const express = require('express'),
    routePosition = require('./api/position'),
    routeRooms = require('./api/rooms'),
    routePlayers = require('./api/players'),
    routeStatistics = require('./api/statistics'),
    routeRoomList = require('./api/room_list'),
    routeBoard = require('./api/board'),
    routeCreateRoom = require('./api/create_room');

const router = express.Router();

router.use((req, res, next) => {
    if(!req.session.user) {
        res.redirect('/');
    } else {
        next();
    }
});

router.use(routePosition);
router.use(routeRooms);
router.use(routePlayers);
router.use(routeStatistics);
router.use(routeRoomList);
router.use(routeBoard);
router.use(routeCreateRoom);

module.exports = router;