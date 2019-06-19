module.exports = {
  getRandom : function(range){
    return Math.floor(Math.random()*range);
  },
  getWidth : function(){
    return 400;
  },
  getHeight : function(){
    return 700;
  },
  getInitialPlayerSize : function(){
    return 10;
  },
  getBulletSize : function() {
    return 2;
  },
  getDistance : function(x,y,X,Y){
    return Math.sqrt((x-X)*(x-X) + (y-Y)*(y-Y));
  },
  getBulletDirection : function(x,y,X,Y){
    let dist = this.getDistance(x,y,X,Y);
    return {x : (X-x)/dist,y : (Y-y)/dist};
  },
  isColliding : function(a,b,s1,s2){
    let dist = this.getDistance(a.x,a.y,b.x,b.y);
    if(dist < s1+s2) return true;
    else return false;
  },
  getMinimumPlayerSize : function(){
    return 5;
  }
};