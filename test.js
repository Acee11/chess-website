const Sequelize = require('sequelize'),
    User = require('./models/user'),
    Game = require('./models/games');

const Op = Sequelize.Op;

(async () => {
    try {
        // await Game.create({
        //     pgn: '',
        //     whiteId: 1,
        //     blackId: 2,
        //     winner: 'w'
        // });

        let games = await Game.findAll({
            where: {
                [Op.or]: [{
                        whiteId: 1
                    },
                    {
                        blackId: 1
                    }
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
        let gm = games[1];
        console.log(gm.dataValues);
        console.log('--------------------------');
        console.log(gm.white.dataValues);
        console.log('--------------------------');
        console.log(gm.black.dataValues);
        // console.log(gm.white.users.dataValues);
    } catch (err) {
        console.log(err);
    }

})();