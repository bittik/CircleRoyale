function Player(x,y,id,size){
    this.id = id;
    this.x = x;
    this.y = y;
    this.size = size;
}
Player.prototype.destroyPlayer = function(gameState){
    for(let i=0;i < gameState.players.length;i++){
        if(gameState.players[i].id === this.id){
           gameState.players.splice(i,1);
        }
    }
}
module.exports = Player;
