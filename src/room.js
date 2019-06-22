let Player = require('./player');
let Bullet = require('./bullet');
let utils = require('./utils');

function Room(id){
    this.id = id;
    this.gameState = {
        players : [],
        bullets : [],
        playerCount : 0,
        bulletCount : 0,
        gameRunning : false
    }
    this.loop = null;
}
Room.prototype.addPlayer = function(name){
    this.gameState.playerCount = this.gameState.playerCount + 1;
    let player = new Player(this.gameState.playerCount,name);
    this.gameState.players.push(player);
    return player;
}
Room.prototype.addBullet = function(x,y,direction,player){
    this.gameState.bulletCount = this.gameState.bulletCount + 1;
    let bullet = new Bullet(x,y,this.gameState.bulletCount,direction,5,player);
    bullet.adjustInitialPosition();
    this.gameState.bullets.push(bullet);
}
Room.prototype.startLoop = function(io){
    io.sockets.in(this.id).emit('loop_started');
    this.gameState.temp = [];
    for(let player of this.gameState.players){
        this.gameState.temp.push(player);
    }
    this.loop = setInterval(function(id,io,gameState){

        //game loop starts here
        if(gameState.players.length <= 1){
            //End The Loop
            clearInterval(this);
            if(gameState.players.length){

                //TODO :- Fix the winner mechanism
                io.sockets.in(id).emit('log',gameState.players[0].name + ' ' +'won !');

            }
            gameState.gameRunning = false;
            gameState.players = [];
            for(let player of gameState.temp){
                gameState.players.push(player);
            }
            for(let p of gameState.players){
                p.resetReady();
            }
            io.sockets.in(id).emit('game_end');
            io.sockets.in(id).emit('players_joined',gameState.players);
            return;
        }
        for(let player of gameState.players){
            player.correctOutOfBounds();
        }
        for(bullet of gameState.bullets){
            bullet.updatePosition(gameState);
        }
        io.sockets.in(id).emit('render', gameState);
    },50,this.id,io,this.gameState);
}
Room.prototype.getPlayers = function(){
    return this.gameState.players;
}
Room.prototype.updatePlayer = function(p){
    for(let player of this.gameState.players){
        if(player.id === p.id)continue;
        if(utils.isColliding(p,player,p.size,player.size))return;
    }
    for(let player of this.gameState.players){
        if(player.id === p.id){
            player.x = p.x;
            player.y = p.y;
            player.size = p.size;
        }
    }
}
Room.prototype.deletePlayer = function(p){
    for(let i=0;i < this.gameState.players.length;i++){
        if(this.gameState.players[i].id === p.id){
           this.gameState.players.splice(i,1);
        }
    }
}
Room.prototype.getGameState = function(){
    return this.gameState;
}
Room.prototype.getGameRunning = function(){
    return this.gameState.gameRunning;
}
Room.prototype.setGameRunning = function(val){
    this.gameState.gameRunning = val;
}
Room.prototype.readyPlayer = function(player,io){
    for(let p of this.gameState.players){
        if(p.id === player.id){
            p.setReady(true);
        }
    }
    let allReady = true;
    for(let p of this.gameState.players){
        if(!p.getReady())allReady=false;
    }
    if(allReady){
        this.startNewGame(io);
    }
}
Room.prototype.startNewGame = function(io){
    this.startLoop(io);
    this.setGameRunning(true);
    this.gameState.bullets=[];
}
module.exports = Room;