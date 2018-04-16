const Chess = require('chess.js').Chess,
    sanitizer = require('sanitizer'),
    User = require('./models/user'),
    Game = require('./models/games');

const ioOptions = {
    origins: 'https://localhost:3000',
};

io = require('socket.io')(ioOptions);
async function afterOver(room, winner) {
    try {

        if(!room.white.id && !room.black.id) {
            return;
        }
        let currGame = room.game;
        await Game.create({
            pgn: currGame.pgn(),
            whiteId: room.white.id,
            blackId: room.black.id,
            winner: winner
        });
        
    } catch(err) {
        console.log(err);
    }
    
}

let rooms = {};

io.on('connect', (socket) => {
    if (!socket.handshake.session.user) {
        return;
    }
    if (socket.handshake.session.room) {
        socket.join(socket.handshake.session.room);
    }
    // socket.on('disconnect', function () {
    //     console.log('user disconnected');
    // });

    socket.on('createRoom', (data) => {
        if (socket.handshake.session.room) {
            socket.emit('createRoom', {
                err: true,
                msg: "You already are in the room",
            });
            return;
        }
        let roomName = data;
        if (roomName in rooms) {
            socket.emit('createRoom', {
                err: true,
                msg: "Room with this name already exists",
            });
            return;
        }
        socket.handshake.session.room = roomName;
        socket.join(roomName);
        rooms[roomName] = {
            game: new Chess(),
            black: null,
            white: null,
            players: 1,
        };
        socket.handshake.session.save();
        socket.emit('createRoom', {
            err: false,
        });
    });

    socket.on('joinRoom', (data) => {
        let roomName = data.roomName;
        if (socket.handshake.session.room) {
            socket.emit('joinRoom', {
                err: true,
                msg: "You already are in the room",
            });
            return;
        }
        if (!roomName in rooms) {
            socket.emit('joinRoom', {
                err: true,
                msg: "Such room does not exist",
            });
            return;
        }
        socket.handshake.session.room = roomName;
        socket.join(roomName);
        socket.handshake.session.save();
        rooms[roomName].players++;
        socket.emit('joinRoom', {
            err: false,
        });
    });

    socket.on('move', (data) => {
        let roomName = socket.handshake.session.room;
        let userName = socket.handshake.session.user.username;
        if (!roomName) {
            return;
        }
        let currRoom = rooms[roomName]
        if (!currRoom) {
            return;
        }

        if(!currRoom.gameStarted) {
            return;
        }

        let from = data.from;
        let square = currRoom.game.get(from);
        if(!square) {
            return;
        }
        if (square.color === 'w') {
            if (currRoom.white.name !== userName) {
                return;
            }
        } else if (square.color === 'b') {
            if (currRoom.black.name !== userName) {
                return;
            }
        }

        let game = currRoom.game;
        let legal = game.move(data);
        if (legal) {
            socket.broadcast.to(roomName).emit('move', data);
        }

        if(game.game_over()) {
            currRoom.gameStarted = false;
            currRoom.whiteready = null;
            currRoom.blackready = null;

            let winner;
            if (game.in_draw()) {
                winner = 'd';
            } else {
                winner = game.turn() === 'w' ? 'b' : 'w';
            }

            afterOver(currRoom, winner);
        }
    });

    socket.on('takeSeat', (data) => {
        let color = data.color;
        let roomName = socket.handshake.session.room;
        let userId = socket.handshake.session.user.id;
        let userName = sanitizer.escape(
            socket.handshake.session.user.username
        );
        if (!roomName) {
            return;
        }
        let currRoom = rooms[roomName];
        if (currRoom.gameStarted) {
            return;
        }

        if(color !== 'white' && color !== 'black') {
            return;
        }
        
        let otherColor = color === 'white' ? 'black' : 'white';
        if (currRoom[otherColor] && currRoom[otherColor].name == userName) {
            return;
        }

        // user is leaving his seat
        if (currRoom[color] && currRoom[color].name === userName) {
            currRoom[color] = null;
            currRoom[`${color}ready`] = null;
            io.sockets.in(roomName).emit('takeSeat', {
                self: false,
                color: color,
                name: '---',
            });
            return;
        }

        if (currRoom[color] !== null) {
            return;
        }

        currRoom[color] = {
            name: userName,
            id: userId,
        };
        socket.broadcast.emit('takeSeat', {
            self: false,
            color: color,
            name: userName,
        });

        socket.emit('takeSeat', {
            self: true,
            color: color,
            name: userName,
        });
    });

    socket.on('ready', () => {
        let color = null;
        let roomName = socket.handshake.session.room;
        let userName = socket.handshake.session.user.username;
        if(!roomName) {
            return;
        }
        if(!rooms[roomName]) {
            return;
        }
        let currRoom = rooms[roomName];
        let currGame = currRoom.game;
        if(currRoom.gameStarted) {
            return;
        }
        if (currRoom.black && currRoom.black.name === userName) {
            color = 'black';
        } else if (currRoom.black && currRoom.white.name === userName) {
            color = 'white';
        }

        if(color === null) {
            return;
        }

        currRoom[`${color}ready`] = socket;

        let otherColor = color === 'white' ? 'black' : 'white';
        if (currRoom[`${otherColor}ready`]) {
            socket.emit('gameStart', {
                color: color,
            });
            currRoom[`${otherColor}ready`].emit('gameStart', {
                color: otherColor,
            });
            currRoom.game = new Chess();
            currRoom.gameStarted = true;
        } 
    });

    socket.on('leaveRoom', () => {
        let roomName = socket.handshake.session.room;
        let userName = socket.handshake.session.user.username;

        if(!roomName) {
            return;
        }
        let currRoom = rooms[roomName];
        
        let seatColor;
        if (currRoom.white && currRoom.white.name == userName) {
            seatColor = 'white';
        } else if (currRoom.black && currRoom.black.name == userName) {
            seatColor = 'black';
        }


        if(seatColor) {
            if(currRoom.gameStarted) {
                return;
            }
            currRoom[seatColor] = null;
            currRoom[`${seatColor}ready`] = null;
            socket.broadcast.to(roomName).emit('takeSeat', {
                self: false,
                color: seatColor,
                name: '---',
            });
        }
        socket.leave(roomName);
        currRoom.players--;
        if(!currRoom.players) {
            delete rooms[roomName];
        }
        delete socket.handshake.session.room;
        socket.handshake.session.save();
        socket.emit('leaveRoom');
    });

    socket.on('resign', () => {
        let roomName = socket.handshake.session.room;
        let userName = socket.handshake.session.user.username;
        if (!roomName) {
            return;
        }
        let currRoom = rooms[roomName];
        if (!currRoom.gameStarted) {
            return;
        }

        let color;
        if (currRoom.white && currRoom.white.name === userName) {
            color = 'white';
        } else if (currRoom.black && currRoom.black.name === userName) {
            color = 'black';
        }

        if(!color) {
            return;
        }
        currRoom.gameStarted = false;
        currRoom.whiteready = null;
        currRoom.blackready = null;
        io.sockets.in(roomName).emit('resign', {
            color: color
        });
        afterOver(currRoom, color === 'black' ? 'w' : 'b');
    });
});

module.exports = {
    io: io,
    rooms: rooms,
};
