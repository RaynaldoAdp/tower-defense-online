var socket_io = require('socket.io');
var http = require('http');
var express = require('express');

var app = express();
app.use(express.static('public'));

var server = http.Server(app);
var io = socket_io(server);

var playerCount = 0;

io.on('connection', function(socket) {
    playerCount++;
    if(playerCount % 2 === 0){
        socket.broadcast.emit('player1Found');
        socket.emit('player2Found');
    }
    
    socket.on('roleChosen', function(data){
        if(data === "Attacker"){
            socket.emit('attacker', 'attacker');
            socket.broadcast.emit('defender', 'defender');
        }
        else{
            socket.emit('defender', 'defender');
            socket.broadcast.emit('attacker', 'attacker');
        }
    })
    
    socket.on('createNewTile', function(data){
        socket.broadcast.emit('createNewTile', data);
    })
    
    socket.on('createNewTower', function(data){
        socket.broadcast.emit('createNewTower', data); 
    });
    
    socket.on('beginGame', function(data){
        socket.broadcast.emit('beginGame', data);  
    });
    
    socket.on('attackerTurnEnd', function(){
        socket.broadcast.emit('defenderTurn');
    });
    
    socket.on('defenderTurnEnd', function(){
        socket.broadcast.emit('attackerTurn');
    });    
});

server.listen(process.env.PORT || 8080);