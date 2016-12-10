var Enemy = function(){
	this.y = 620;
	this.x = 20;
	this.r = 10;
	this.hp = 3;
	this.toDelete = false;
	this.velocityX = 0;
	this.velocityY = 2;
	this.index = 0;

	this.show = function(){
		fill(255);
		ellipse(this.x, this.y , this.r * 2, this.r * 2);
		this.y -= this.velocityY;	
		this.x += this.velocityX;
	}

	this.minusHp = function(){
		this.hp -= 1;
		if(this.hp === 0){
			this.disappear();
		}
	}

	this.disappear = function(){
		this.toDelete = true;
	}

	this.update = function(path, frameCount, currentFrameCount){
		//the function needs to start from framecount zero to get expected movements. 
		//This is an alternative since we cant reset the framecount
		var frameCountFromZero = frameCount - currentFrameCount; 
		if (frameCountFromZero % 20 === 0){
			var dir = path[this.index];
			if(path[this.index] === "North"){
			this.velocityX = 0;
			this.velocityY = 2;
			}
			else if(path[this.index] === "East"){
				this.velocityX = 2;
				this.velocityY = 0;
			}
			else if(path[this.index] === "South"){
				this.velocityX = 0;
				this.velocityY = -2;
			}
			else if(path[this.index] === "West"){
				this.velocityX = -2;
				this.velocityY = 0;
			}
			this.index++;			
		}
	}		
}