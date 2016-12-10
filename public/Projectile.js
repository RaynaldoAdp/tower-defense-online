var Projectile = function(tower){
	this.x = tower.x;
	this.y = tower.y;
	this.r = 4;
	this.toDelete = false;
	this.velocityX = 0;
	this.velocityY = 0;

	this.show = function(){
		fill(255);	
		ellipse(this.x, this.y , this.r * 2, this.r * 2);
	}

	this.setVelocity = function(enemy){
		this.velocityX = (this.x - enemy.x) / 5;
		this.velocityY = (this.y - enemy.y) / 5;
	}

	this.update = function(){
		this.x -= this.velocityX;
		this.y -= this.velocityY;
	}

	this.hit = function(enemy){
		var distance = dist(this.x, this.y, enemy.x, enemy.y);
		if(distance < this.r + enemy.r) {
			return true;
		}
		else{
			return false;
		}
	}

	this.disappear = function(enemy){
		this.toDelete = true;
	}

}