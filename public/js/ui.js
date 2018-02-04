var socket = io();
var board;
var game = new Chess();

var currColor;

socket.on('move', function(data) {
    game.move(data);
    board.position(game.fen());
    updateStatus();
});

socket.on('createRoom', function(data) {
    if (data.err) {
        alert(data.msg);
        return;
    }
    game = new Chess();
    board.position(game.fen());
    loadGame();
});

socket.on('joinRoom', function(data) {
    if (data.err) {
        alert(data.msg);
        return;
    }
    loadGame();
    loadBoard();
});

socket.on('takeSeat', function(data) {
    var color = data.color;
    var name = data.name;
    var self = data.self;

    var seatName = "#seat-" + color;
    if ($(seatName).length === 1) {
        if (name === '---') {
            $(seatName).html(name);
            $(seatName).attr("disabled", false);
        } else {
            $(seatName).html(name + (self ? "(leave)" : ""));
            $(seatName).attr("disabled", !self);
        }
        
    }
});

socket.on('gameStart', function(data) {
    let color = data.color;
    cfg.draggable = true;
    cfg.position = 'start';
    cfg.orientation = color;
    currColor = color[0];
    // game.load(cfg.position);
    game = new Chess();
    if($("#board").length === 1) {
        board = ChessBoard('board', cfg);
    }
    updateStatus();
});

socket.on('leaveRoom', function() {
    loadRoomList();
});

socket.on('resign', function(data) {
    let winner = data.color === 'white' ? 'black' : 'white';
    $("#game-move").html('Winner: ' + data.color);
    cfg.draggable = false;
    cfg.position = game.fen();
    if($("#board").length === 1) {
        board = ChessBoard('board', cfg);
    }
});

var onDragStart = function (source, piece, position, orientation) {
    if (game.game_over() === true ||
    (game.turn() !== currColor) ||
    piece[0] !== currColor){
        return false;
    }
};

var onDrop = function (source, target) {
    // see if the move is legal
    var move = {
        from: source,
        to: target,
        promotion: 'q' // NOTE: always promote to a queen for example simplicity
    };

    var isLegal = game.move(move);

    // illegal move
    if (isLegal === null) return 'snapback';
    updateStatus();
    socket.emit('move', move);
};

// update the board position after the piece snap 
// for castling, en passant, pawn promotion
var onSnapEnd = function () {
    board.position(game.fen());
    updateStatus();
};

function updateStatus() {
    
    var status;
    var over = game.game_over();
    var turn = game.turn();
    if (turn === 'b') {
        turn = 'black';
    } else {
        turn = 'white';
    }

    if(over) {
        if (game.in_draw()) {
            status = 'Draw';
        } else if (game.in_stalemate()) {
            status = 'Draw (stalemate)';
        } else if (game.in_checkmate()) {
            if (turn === 'black') {
                turn = 'white';
            } else {
                turn = 'black';
            }
            status = 'Winner: ' + turn;
        }
    } else {
        status = 'Move: ' + turn;
    }
    $("#game-move").html(status);
}




function loadBoard() {
    $.get('/api/position', function(data) {
        let position = data.position;
        if (position) {
            game = new Chess(position);
        } else {
            game = new Chess();
        }
        cfg.position = game.fen();
        board = ChessBoard('board', cfg);
    }, 'json');
}


function loadRooms() {
    $.get('/api/rooms', function(data) {
        $("#room-list").html(data);
    });
}

function clearRooms() {
    $("#room-list").html('');
}

function loadRoomList() {
    $.get('/roomlist', function (data) {
        $("#user-view").html(data);
        loadRooms();
    });
}

function loadGame() {
    
    $.get('/board', function (datahtml) {
        $("#user-view").html(datahtml);
        $.get('/api/position', function(data) {
            cfg.position = data.position || 'start';
            game.load(cfg.position);
            if(data.player) {
                cfg.orientation = data.player;
                currColor = data.player[0];
                if(data.started) {
                    cfg.draggable = true;
                }
            } else {
                cfg.draggable = false;
            }
            
            board = ChessBoard('board', cfg);
        }, 'json');
        updateStatus();
        loadPlayers();
    });
}

function loadPlayers() {
    $.get('/api/players', function (data) {
        $("#seat-white").html(data.white);
        $("#seat-black").html(data.black);
    }, 'json');
}

function loadStatistics() {
    $.get('/api/statistics', function (data) {
        $("#user-view").html(data);
    });
}

var cfg = {
    position: 'start',
    draggable: false,
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd
};



$("#ui-btn-logout").click(function() {
    var _csrf = $('input[name="_csrf"]').attr('value');
    $.ajax({
        type: "POST",
        url: '/logout',
        data: {
            _csrf: _csrf,
        },
        success: function() {
            window.location.href = '/';
        }
    });
});

$("#ui-btn-roomlist").click(function() {
    loadRoomList();
});

$("#ui-btn-game").click(function () {
    loadGame();
});

$("#ui-btn-stats").click(function () {
    loadStatistics();
});

$("#user-view").on('click', '#room-create-btn', function() {
    $.get('/createroom', function(data) {
        $("#user-view").html(data);
    });
});

$("#user-view").on('click', '#create-room-create-btn', function () {
    let roomName = $('#room-name').val();
    socket.emit('createRoom', roomName);
    loadRoomList();
});

$("#user-view").on('click', '#create-room-cancel-btn', function () {
    loadRoomList();
});

$("#user-view").on('click', '#room-refresh-btn', function () {
    clearRooms();
    loadRooms();
});

$("#user-view").on('click', '.room-list-item', function() {
    var roomName = $(this).val();
    socket.emit('joinRoom', {
        roomName: roomName,
    });
});

$("#user-view").on('click', '#seat-white', function () {
    socket.emit('takeSeat', {
        color: 'white',
    });
});

$("#user-view").on('click', '#seat-black', function () {
    socket.emit('takeSeat', {
        color: 'black',
    });
});

$("#user-view").on('click', '#ready', function () {
    socket.emit('ready');
});

$("#user-view").on('click', '#btn-leave-room', function () {
    socket.emit('leaveRoom');
});

$("#user-view").on('click', '#btn-resign', function () {
    socket.emit('resign');
});

$(document).ready(function () {
    loadGame();
});