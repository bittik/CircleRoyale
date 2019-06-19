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
  newRoom.startLoop(io);
  rooms.push(newRoom);
  return newRoom;
}

io.on('connection',function(socket){
  let room = null;
  let player = null;
  socket.on('submit',function(data){
    socket.join(data.room);
    room = getRoom(data.room);
    player = room.addPlayer();
    socket.emit('init_player',player);
  });
  socket.on('player_update',function(p){
    if(!player)return;
      room.updatePlayer(p);
  });
  socket.on('shoot',function(target){
    if(!player)return;
    let bulletDirection = utils.getBulletDirection(player.x,player.y,target.x,target.y);
    room.addBullet(player.x,player.y, bulletDirection,player);
  });
  socket.on('debug',function(data){
    console.log(data);
  });
  socket.on('disconnect',function(){
    if(!player)return;
      player.destroyPlayer(room.getGameState());
  });
});

http.listen(80, function(){
  console.log('listening on *:80');
});
