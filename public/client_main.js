//initialize socket
var socket = io();
var c = document.getElementById("myCanvas");

// Get the device pixel ratio, falling back to 1.
var dpr = window.devicePixelRatio || 1
var isMousePressed = false;
var playerCanShoot = false;
var timeoutId = null;

// var image = new Image();
// image.src = "https://owips.com/sites/default/files/clipart/drawn-spaceship/383245/drawn-spaceship-top-view-383245-1212752.png";

var width = 400;
var height = 700;

c.width = width * dpr;
c.height = height * dpr;
c.style.width = width;
c.style.height = height;
var movementUnit = 5;
var ctx = c.getContext("2d");
ctx.scale(dpr, dpr);
function getDistance(x,y,X,Y){
  return Math.sqrt((x-X)*(x-X) + (y-Y)*(y-Y));
}

player = null;
gameStateLocal = null;
//drawing background in black
var clearCanvas = function(){
  ctx.fillStyle="black";
  ctx.fillRect(0,0,width,height);
};
clearCanvas();

function drawGameLogo(){
  ctx.font = "30px Arial"
  ctx.fillStyle="red";
  ctx.fillText("Circle",130,100);
  ctx.fillText("Royale",180,140);
}
drawGameLogo();
function client_submit(){
  let room = document.getElementById('lobby').value;
  let name = document.getElementById('name').value;
  room = room.toLowerCase();
  name = name.toLowerCase();
  // verify login input
  if(room == ''){
    log("Please enter Valid Room !");
    return;
  } 
  if(name == ''){
    log("Please enter Valid Name !");
    return;
  }

  socket.emit('submit', {room: room , name : name});
  document.getElementById('login').style.display = 'none';
  document.getElementById('listplayers').style.display = 'flex';
}
function ready(){
  socket.emit('ready');
}
function leave(){
  socket.emit('leave');
  document.getElementById('login').style.display = 'flex';
  document.getElementById('listplayers').style.display = 'none';
}

var drawPlayer = function(player) {
  //making the circle 
  // ctx.drawImage(image, player.x , player.y , player.size * 2 , player.size * 2);
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.size, 0, 2 * Math.PI);
  ctx.fillStyle="green";
  ctx.fill();
};

var drawBullet = function(bullet) {
  //making the circle 
  ctx.beginPath();
  ctx.arc(bullet.x, bullet.y, 2, 0, 2 * Math.PI);
  ctx.fillStyle="red";
  ctx.fill();
};
socket.on('render',function(gameState){
  //render incoming data on screen
  gameStateLocal = gameState;
  clearCanvas();
  for(let p of gameState.players){
    drawPlayer(p);
    if(p.id === player.id){
      player = p;
    }
  }
  for(let b of gameState.bullets){
    drawBullet(b);
  }
});

function renderLocal(){
  clearCanvas();
  for(let p of gameStateLocal.players){
    drawPlayer(p);
    if(p.id === player.id){
      player = p;
    }
  }
  for(let b of gameStateLocal.bullets){
    drawBullet(b);
  }
}

socket.on('player_init',function(p){
   console.log(p);
   player=p;
});
socket.on('game_end',function(){
  clearCanvas();
  drawGameLogo();
  console.log('gameEnd');
  document.getElementById('listplayers').style.display = 'flex';
});
socket.on('players_joined',function(players){
  let node =  document.getElementById('list');
  while(node.firstChild){
    node.removeChild(node.firstChild);
  }
  for(let player of players){
    let li = document.createElement('div');
    li.appendChild(document.createTextNode(player.name));
    li.appendChild(document.createTextNode(player.ready?'  :  Ready':'  :  Not Ready'));
    document.getElementById('list').appendChild(li);
  }
});
socket.on('loop_started',function(){
  document.getElementById('listplayers').style.display = 'none';
});
socket.on('log',function(message){
  log(message);
})
function log(message){
  alert(message);
}
function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

//Pointer events
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
    renderLocal();
    socket.emit('player_update',player);
  }
});

// touch events
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
    renderLocal();
    socket.emit('player_update',player);
  }
});
