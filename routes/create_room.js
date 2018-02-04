const express = require('express');

const router = express.Router();

router.get('/createroom', (req, res) => {
    res.render('create_room');
});

module.exports = router;