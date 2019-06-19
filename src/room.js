let Player = require('./player');
let Bullet = require('./bullet');
let utils = require('./utils');

function Room(id){
    this.id = id;
    this.gameState = {
        players : [],
        bullets : [],
        playerCount : 0,
        bulletCount : 0
    }
    this.loop = null;
}
Room.prototype.addPlayer = function(){
    this.gameState.playerCount = this.gameState.playerCount + 1;
    let player = new Player(utils.getRandom(utils.getWidth()),utils.getRandom(utils.getWidth()),this.gameState.playerCount,utils.getInitialPlayerSize());
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
    this.loop = setInterval(function(id,io,gameState){
        //game loop starts here

        for(bullet of gameState.bullets){
            bullet.updatePosition(gameState);
        }
        for(player of gameState.players){
            if(player.size < utils.getMinimumPlayerSize())player.destroyPlayer(gameState);
        }
        io.sockets.in(id).emit('render', gameState);
    },50,this.id,io,this.gameState);
}
Room.prototype.getPlayers = function(){
    return this.gameState.players;
}
Room.prototype.updatePlayer = function(p){
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
module.exports = Room;