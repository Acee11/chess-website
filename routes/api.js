const express = require('express'),
    routePosition = require('./api/position'),
    routeRooms = require('./api/rooms'),
    routePlayers = require('./api/players'),
    routeStatistics = require('./api/statistics');

const router = express.Router();

router.use(routePosition);
router.use(routeRooms);
router.use(routePlayers);
router.use(routeStatistics);

module.exports = router;