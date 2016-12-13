var socket_io = require('socket.io');
var http = require('http');
var express = require('express');

var app = express();
app.use(express.static('public'));

var server = http.Server(app);
var io = socket_io(server);

var playerCount = 0;

var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var config = require('./config');
app.use(bodyParser.json());

var Item = require('./models/item');

mongoose.connect('mongodb://raynaldoadp:raynaldoadp@ds139567.mlab.com:39567/raynaldodb');

//socket.io for real time experience
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

//mongodb logic
var storage = {
    findDefenderScore : function(callback){
      Item.find()
      .sort('-defenderScore')
      .limit(3)
      .exec(callback);
    },
    findAttackerScore: function(callback){
      Item.find()
      .sort('-attackerScore')
      .limit(3)
      .exec(callback);
    },
    add: function(data, callback){
      Item.create({userName : data.username, attackerScore : data.attackerScore, defenderScore: data.defenderScore}, callback);    
    }
}

app.get('/items/attackerScore', function(req,res) {
    storage.findAttackerScore(function(err, items){
        if(err) {
            return res.status(500).json({
                message: 'Internal Server Error'
            });
        }
        res.json(items);
    });
});

app.get('/items/defenderScore', function(req,res){
    storage.findDefenderScore(function(err,items){
        if(err) {
            return res.status(500).json({
                message: 'Internal Server Error'
            });
        }
        res.json(items);
    }); 
});

app.post('/items', function(req, res) {
    storage.add(req.body, function(err, item){
        if(err){
            return res.status(500).json({
                message: 'Internal Server Error'
            });
        }
        res.status(201).json(item);
    });
});


server.listen(process.env.PORT || 8080);