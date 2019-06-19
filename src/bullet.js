let utils = require('./utils');

function Bullet(x,y,id,direction,velocity,shooter){
    this.id = id;
    this.shooter = shooter;
    this.x = x;
    this.y = y;
    this.velocity = velocity;
    this.direction = direction;
}
Bullet.prototype.adjustInitialPosition = function(){
    this.x = this.x + this.direction.x * this.shooter.size;
    this.y = this.y + this.direction.y * this.shooter.size;
}
Bullet.prototype.updatePosition = function(gameState){
    let bullets = gameState.bullets;
    this.x = this.x + this.direction.x * this.velocity;
    this.y = this.y + this.direction.y * this.velocity;
    let width = utils.getWidth();
    let height = utils.getHeight();
    if(this.x < 0 || this.y < 0 || this.x > width || this.y > height){
        this.destroyBullet(gameState);
        return;
    };
    this.shootPlayer(gameState);

}
Bullet.prototype.shootPlayer = function(gameState){
    let players = gameState.players;
    for(let player of players){
        if(utils.isColliding(player,this,utils.getBulletSize(),player.size)){
            player.size -= 1;
            this.destroyBullet(gameState);
        };
    }
}
Bullet.prototype.destroyBullet = function(gameState){
    let bullets = gameState.bullets;
    for(let i=0;i < bullets.length;i++){
        if(bullets[i].id === this.id){
           bullets.splice(i,1);
        }
    }
}
module.exports = Bullet;