let utils = require('./utils');
function Player(id,name){
    this.id = id;
    this.x = null;
    this.y = null;
    this.size = null;
    this.ready = false;
    this.name = name;
}
Player.prototype.destroyPlayer = function(gameState){
    for(let i=0;i < gameState.players.length;i++){
        if(gameState.players[i].id === this.id){
           gameState.players.splice(i,1);
        }
    }
}
Player.prototype.getReady = function(){
    return this.ready;
}
Player.prototype.setReady = function(value){
    this.ready = value;
}
Player.prototype.initPlayer = function(){
    this.x = utils.getRandom(utils.getWidth());
    this.y = utils.getRandom(utils.getHeight());
    this.size = utils.getInitialPlayerSize();
}
Player.prototype.resetReady = function(){
    this.ready = false;
}
module.exports = Player;
