var Tile = function(x, y, mode){
	if(mode ==='road'){
		this.color = 0;
	}
	else{
		this.color = 255;
	}
	this.x = x;
	this.y = y;

	this.show = function(){
		fill(this.color);
		rect(this.x, this.y , 40, 40);
	}
}