//initialize socket
var socket = io();
var c = document.getElementById("myCanvas");

// Get the device pixel ratio, falling back to 1.
var dpr = window.devicePixelRatio || 1
var isMousePressed = false;
var playerCanShoot = false;
var timeoutId = null;

c.width = 400 * dpr;
c.height = 700 * dpr;
c.style.width = 400;
c.style.height = 700;
var width = c.width;
var height = c.height;
var movementUnit = 10;
var ctx = c.getContext("2d");
ctx.scale(dpr, dpr);

function getDistance(x,y,X,Y){
  return Math.sqrt((x-X)*(x-X) + (y-Y)*(y-Y));
}
//drawing background in black
var clearCanvas = function(){
  ctx.fillStyle="black";
  ctx.fillRect(0,0,width,height);
};
clearCanvas();

player = null;
function client_submit(){
  let room = document.getElementById('lobby');
  let name = document.getElementById('name');
  let login = document.getElementById('login');
  login.remove();
  socket.emit('submit', {room: room.value , name : name.value});
}
function client_send(){
  let chat = document.getElementById('chat');
  socket.emit('chat',chat.value);
}

var drawPlayer = function(player) {
  //making the circle 
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.size, 0, 2 * Math.PI);
  ctx.fillStyle="red";
  ctx.fill();
};

var drawBullet = function(bullet) {
  //making the circle 
  ctx.beginPath();
  ctx.arc(bullet.x, bullet.y, 2, 0, 2 * Math.PI);
  ctx.fillStyle="white";
  ctx.fill();
};
socket.on('render',function(gameState){
  clearCanvas();
  console.log(gameState.bullets);
  for(let p of gameState.players){
    drawPlayer(p);
  }
  for(let b of gameState.bullets){
    drawBullet(b);
  }
});

socket.on('init_player',function(p){
   console.log(p);
   player=p;
});

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}
c.addEventListener("mousedown",function(e){
  e.preventDefault();
  if(!player)return;
  isMousePressed = true;
  timeoutId = setTimeout(function(){
    if(isMousePressed && player){
      playerCanShoot=true;
    }
  },400);
});

//Pointer events
c.addEventListener("mouseup",function(event){
  event.preventDefault();
  if(!player)return;
  let pos = getMousePos(c, event);
  isMousePressed = false;
  if(timeoutId)clearTimeout(timeoutId);
  if(playerCanShoot){
    socket.emit('shoot',{
      x: pos.x,y : pos.y
    });
    playerCanShoot = false;
  } else {
    let dist = getDistance(pos.x,pos.y,player.x,player.y);
    player.x = player.x + (((pos.x-player.x)/dist)*movementUnit);
    player.y = player.y + (((pos.y-player.y)/dist)*movementUnit);
    socket.emit('player_update',player);
  }
});

c.addEventListener("touchstart",function(e){
  if(!player)return;
  isMousePressed = true;
  timeoutId = setTimeout(function(){
    if(isMousePressed && player){
      playerCanShoot=true;
    }
  },250);
});

// touch events
c.addEventListener("touchend",function(event){
  event.preventDefault();
  if(!player)return;
  event.clientX = event.changedTouches[0].pageX;
  event.clientY = event.changedTouches[0].pageY;
  let pos = getMousePos(c, event);
  isMousePressed = false;
  if(timeoutId)clearTimeout(timeoutId);
  if(playerCanShoot){
    socket.emit('shoot',{
      x: pos.x,y : pos.y
    });
    playerCanShoot = false;
  } else {
    let dist = getDistance(pos.x,pos.y,player.x,player.y);
    player.x = player.x + (((pos.x-player.x)/dist)*movementUnit);
    player.y = player.y + (((pos.y-player.y)/dist)*movementUnit);
    socket.emit('player_update',player);
  }
});
