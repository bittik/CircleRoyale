let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let Room = require('./src/room');
let utils = require('./src/utils');
app.use(express.static(__dirname+'/public'));

let rooms = [];

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

function getRoom(id){
  for(let r of rooms){
    if(r.id === id){
      return r;
    }
  }
  let newRoom = new Room(id);
  rooms.push(newRoom);
  return newRoom;
}
function newPlayer(data,connState,socket){
  connState.room = getRoom(data.room);
  if(connState.room.getGameRunning()){
    connState.room = null;
    socket.emit('log',"Game Already Running !");
  }
  else {
    connState.player = connState.room.addPlayer(data.name);
    socket.join(data.room);
    io.sockets.in(connState.room.id).emit('players_joined',connState.room.getPlayers());
  }
}
function leavePlayer(connState,socket){
  if(!connState.player)return;
  connState.player.destroyPlayer(connState.room.getGameState());
  socket.leave(connState.room.id);
  io.sockets.in(connState.room.id).emit('players_joined',connState.room.getPlayers());
}
io.on('connection',function(socket){
  let connState = {
    room : null,
    player : null
  }
  socket.on('submit',function(playerData){
    newPlayer(playerData,connState,socket);
  });
  socket.on('player_update',function(p){
    if(!connState.player)return;
      connState.room.updatePlayer(p);
  });
  socket.on('shoot',function(target){
    if(!connState.player)return;
    let bulletDirection = utils.getBulletDirection(connState.player.x,connState.player.y,target.x,target.y);
    connState.room.addBullet(connState.player.x,connState.player.y, bulletDirection,connState.player);
  });
  socket.on('ready',function(){
    connState.room.readyPlayer(connState.player,io);
    connState.player.initPlayer();
    socket.emit('player_init',connState.player);
    io.sockets.in(connState.room.id).emit('players_joined',connState.room.getPlayers());
  });
  socket.on('disconnect',function(){
    leavePlayer(connState,socket);
  });
  socket.on('leave',function(){
    leavePlayer(connState,socket);
  });
});

http.listen(80, function(){
  console.log('listening on *:80');
});
