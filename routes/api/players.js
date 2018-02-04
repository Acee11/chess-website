const express = require('express'),
    rooms = require('./../../iogame').rooms;

const router = express.Router();

router.get('/api/players', (req, res) => {
    let roomName = req.session.room;
    let userName = req.session.user.username;
    let white, black;
    if (roomName) {
        if (rooms[roomName].black) {
            black = rooms[roomName].black.name || '---';
        } else {
            black = '---';
        }
        if (rooms[roomName].white) {
            white = rooms[roomName].white.name || '---';
        } else {
            white = '---';
        }
    }

    if(black === userName) {
        black += '(leave)';
    } else if (white === userName) {
        white += '(leave)';
    }
    res.json({
        white: white,
        black: black,
    });
});

module.exports = router;