var Tile = function(x, y, color){
	this.x = x;
	this.y = y;

	this.show = function(){
		fill(color);
		rect(this.x, this.y , 40, 40);
	}
}