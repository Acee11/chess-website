const express = require('express'),
    User = require('./../../models/user'),
    Game = require('./../../models/games'),
    Sequelize = require('sequelize');

const router = express.Router();
const Op = Sequelize.Op;


router.get('/api/statistics', async (req, res) => {
    try {
        let id = req.session.user.id;
        if (!id) {
            res.render('statistics', {
                games: []
            });
            return;
        }
        let games = await Game.findAll({
            where: {
                [Op.or]: [
                    { whiteId: id },
                    { blackId: id }
                ]
            },
            include: [{
                model: User,
                as: 'white',
            },
            {
                model: User,
                as: 'black',
            }
            ]
        });
        res.render('statistics', {
            games: games
        });
    } catch (err) {
        console.log(err);
    }
});

module.exports = router;