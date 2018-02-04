const Sequelize = require('sequelize'),
    User = require('./user');

const sequelize = new Sequelize('postgres://weppo:weppo1337@localhost:5432/chess');


// setup User model and its fields.
const Game = sequelize.define('games', {
    pgn: {
        type: Sequelize.TEXT,
        allowNull: false,
    },
    winner: {
        type: Sequelize.ENUM('w', 'b', 'd'),
        allowNull: false,
    },
});

Game.belongsTo(User, {
    as: 'white',
    allowNull: false,
});

Game.belongsTo(User, {
    as: 'black',
    allowNull: false,
});


// create all the defined tables in the specified database.
sequelize.sync()
    .then(() => console.log('games table has been successfully created, if one doesn\'t exist'))
    .catch(error => console.log('This error occured', error));

// export User model for use in other files.
module.exports = Game;