const Sequelize = require('sequelize'),
    bcrypt = require('bcrypt');

const sequelize = new Sequelize('postgres://weppo:weppo1337@localhost:5432/chess');

// setup User model and its fields.
const User = sequelize.define('users', {
    username: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    }
}, {
        hooks: {
            beforeCreate: async (user) => {
                const salt = await bcrypt.genSalt();
                user.password = await bcrypt.hash(user.password, salt);
            }
        }
    });

User.prototype.validPassword = function(password) {
    return bcrypt.compare(password, this.password);
}

// create all the defined tables in the specified database.
sequelize.sync()
    .then(() => console.log('users table has been successfully created, if one doesn\'t exist'))
    .catch(error => console.log('This error occured', error));

// export User model for use in other files.
module.exports = User;