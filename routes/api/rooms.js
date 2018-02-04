const express = require('express'),
    rooms = require('./../../iogame').rooms;

const router = express.Router();

router.get('/api/rooms', (req, res) => {
    res.render('rooms', {
        rooms: Object.keys(rooms),
    });
});

module.exports = router;