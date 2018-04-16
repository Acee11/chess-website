const express = require('express');

const router = express.Router();

router.get('/api/roomlist', (req, res) => {
    res.render('room_list');
});

module.exports = router;