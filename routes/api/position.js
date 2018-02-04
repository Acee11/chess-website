const express = require('express'),
    rooms = require('./../../iogame').rooms;

const router = express.Router();

router.get('/api/position', (req, res) => {
    let roomName = req.session.room;
    if (!roomName) {
        res.json({
            position: null,
        });
        return;
    }
    let currRoom = rooms[roomName];
    let currGame = currRoom.game;
    let userName = req.session.user.username;
    let player = null;
    console.log(currRoom.white);
    console.log(currRoom.black);
    if (currRoom.white && currRoom.white.name === userName) {
        player = 'white';
    } else if (currRoom.black && currRoom.black.name === userName) {
        player = 'black';
    }
    res.json({
        position: currGame.fen(),
        player: player,
        started: currRoom.gameStarted,
    });
});

module.exports = router;