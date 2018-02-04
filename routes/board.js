const express = require('express'),
    rooms = require('./../iogame').rooms;

const router = express.Router();

router.get('/board', (req, res) => {
    
    res.render('board');
});

module.exports = router;