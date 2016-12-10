// logic for sockets
var socket = io();
var role;

$(document).ready(function(){

    socket.on('player1Found', function(){
        $('.firstPlayer').remove();
        $('.roleChoice').html(templateForPlayer1);
        getRole();
    })
    
    socket.on('player2Found', function(){
        $('.firstPlayer').remove();
        $('.roleChoice').html(templateForPlayer2);
    })
    
    socket.on('attacker', function(data){
    		$('.roleChoice').remove();
				role = data;
    })
    
    socket.on('defender', function(data){
    		$('.roleChoice').remove();
    		role = data;
    })
    
    socket.on('createNewTile', createNewTile);
    
    socket.on('beginGame', beginGame);
    
    socket.on('createNewTower', createNewTower);
    
});

var templateForPlayer1 =  "<form class='roleForm'>" +
                            	"<label for='chooseRole'> Choose a role! </label>" +
    	 		              	  	"<select class='chooseRole' name='chooseRole'>" +
    			        	      		    "<option value='Attacker'> Attacker </option>" +
    						        			    "<option value='Defender'> Defender </option>" +
    				          		    "</select>" +
    				            	    "<button type='submit'> Choose this role </button>"+
				          				"</form>";

				
var templateForPlayer2 = "<h1>Please wait as the other player is choosing roles</h1>";

function getRole(){
    $('.roleForm').submit(function(event){
        event.preventDefault();
        var role = $('.chooseRole').val();
        socket.emit('roleChosen', role);
    })
}

function createNewTile(data){
		tile = new Tile(data[0], data[1], data[2]);
		tiles.push(tile);
		if(data[2] === 'road'){
				gameArray[14- data[3]][data[4]] = 'Empty';
		}
		else{
				gameArray[14- data[3]][data[4]] = 'Blockage';
		}		
}

function beginGame(data){
		currentFrameCount = data;
		path = findShortestPath([0,0]);
}

function createNewTower(data){
		tower = new Tower(data[0] + 20, data[1] + 20);
		towers.push(tower);
}

//logic for game

//gameArray 15 x 15 representing the state of the game
var gameArray = [];
for(i = 0; i < 15; i++){
	gameArray[i] = [];
	for (j = 0; j < 15; j++){
		gameArray[i][j] = "Neutral";
	}
}
//starting and end point of the game
gameArray[0][0] = "Start";
gameArray[14][14] = "Goal";

//controls the path of the enemies
var path = [];
//array for the enemies spawned
var enemy = [];
//array for the tiles spawned
var tiles = [];
//array for the towers spawned
var towers = [];
//array for projectiles spawned
var projectiles = [];
//controls the color and mode of the tiles
var mode;
//controls whether tower mode is on or off
var towerMode = false;
//controls whether road mode is on or off
var roadMode = false;
//controls whether blockage mode is on or off
var blockageMode = false;
//the framecount when the game starts
var currentFrameCount;
//the framecount after the game starts
var frameCountFromZero;
// controls how many enemies will be spawned
var enemySpawnIndex = 0; 
//queue for projectiles in order to make only 1 projectile exist at a time for one tower.
var queueForProjectiles = [];


//function to detect buttons that are not in canvas
function detectButtons(){
	$('#road').click(function(){
		if(!roadMode){
			roadMode = true;
			mode = 'road';
			towerMode = false;
			blockageMode = false;
		}
		else{
			roadMode = false;
		}
	});
	
	$('#blockage').click(function(){
		if(!blockageMode){
			blockageMode = true;
			mode = 'blockage';
			towerMode = false;
			roadMode = false;
		}
		else{
			tileMode = false;
		}
	});
	
	$('#begin').click(function(){
		currentFrameCount = frameCount;
		//socket to begin game
		socket.emit('beginGame', currentFrameCount);
		path = findShortestPath([0,0]);
	});
	
	$('#tower').click(function(){
		if(!towerMode){
			towerMode = true;
			roadMode = false;
			blockageMode = false;
		}
		else{
			towerMode = false;
		}
	});
}

$(document).ready(function(){
	detectButtons();
});


//main logic of the canvas and the renderings
function setup() {
  createCanvas(600, 600);
  frameRate(20);
}

function draw() {
	background(125);
	
	//starting and ending point tiles
		fill(255, 255, 51);
		rect(560, 0, 40, 40);
		rect(0, 560, 40, 40);
	
	//controls the mechanism to show the tiles
	for(i = 0; i < tiles.length; i++){
		tiles[i].show();
	}

	//constrols the mechanism to show the towers
	for(i = 0; i < towers.length; i++){
		towers[i].show();
	}	

	//controls enemy spawn rate and number of enemies spawned
	frameCountFromZero = frameCount - currentFrameCount + 18;
	if(frameCountFromZero % 20 === 0){
		enemySpawnIndex++;
		for(i = 0; i < enemySpawnIndex; i++){ //spawning too much enemies using for loop!!!!!!!!!
			if(enemySpawnIndex < 11){
				var newEnemy = new Enemy();
				enemy.push(newEnemy);
			}
		}
	}

	//controls the tower detecting and shooting mechanism
	for(i = 0; i < enemy.length; i++){
		enemy[i].show();
		enemy[i].update(path, frameCount, currentFrameCount);
		for(j = 0; j < towers.length; j++){
			if(frameCount % 20 === 0){
				if(towers[j].detect(enemy[i]) && towers[j].queueForProjectiles.length === 0){
					towers[j].addQueue();
					projectile = new Projectile(towers[j]);
					projectile.setVelocity(enemy[i]);
					projectiles.push(projectile);
				}
			}
		}
		for(k = 0; k < projectiles.length; k++){
			if (projectiles[k].hit(enemy[i])){
				projectiles[k].disappear();
				enemy[i].minusHp();
			}
		}
	}

	//controls that each tower only shoots one enemy instead of all enemies
	for(i = 0; i < towers.length; i++){
		for(j = 0; j < projectiles.length; j++){
			for(k = 0; k < enemy.length; k++){
				if(projectiles[j].hit(enemy[k])){
					towers[i].removeQueue();
				}
			}
		}
	}

	//controls the movements of the projectiles of the towers
	for(i = 0; i < projectiles.length; i++){
		projectiles[i].show();
		projectiles[i].update();
	}

	//projectiles to disappear when hit enemies
	for(i = projectiles.length -1; i >= 0; i--){
		if(projectiles[i].toDelete){
			projectiles.splice(i,1);
		}
	}

	//enemies to disappear when its hp finish
	for(i = enemy.length -1; i >= 0; i--){
		if(enemy[i].toDelete){
			enemy.splice(i,1);
		}
	}
}

function mouseClicked(){
	var pixelPositionX = division1(mouseX);
	var pixelPositionY = division1(mouseY);
	var positionX = division2(mouseX);
	var positionY = division2(mouseY);
	//create Tiles
	if(mouseX > 0 && mouseX <600 && mouseY < 600 && mouseY > 0){
		if(roadMode || blockageMode){
			if(gameArray[14- positionY][positionX] ==="Neutral"){
				tile = new Tile(pixelPositionX, pixelPositionY, mode);
				tiles.push(tile);
				if(mode === 'road'){
						gameArray[14- positionY][positionX] = 'Empty';
				}
				else if(mode ==='blockage'){
						gameArray[14- positionY][positionX] = 'Blockage';
				}
				//socket for tiles
				socket.emit('createNewTile', [pixelPositionX, pixelPositionY, mode, positionY, positionX]);
			}
			else{
				alert('Invalid Move');
			}
		}
	}

	//create Towers
	if(mouseX > 0 && mouseX <600 && mouseY < 600 && mouseY > 0)
		if(towerMode && mouseX > 0 && mouseY > 0){
			if(gameArray[14- positionY][positionX] ==="Blockage"){
					tower = new Tower(pixelPositionX+20, pixelPositionY+20);
					towers.push(tower);
			}
			else{
				alert('Must build Towers on Blockages!');
			}
		//socket for towers
		socket.emit('createNewTower', [pixelPositionX, pixelPositionY]);
	}
}

function division1(position){
	var positionBot = position / 40;
	var positionResult = Math.floor(positionBot) * 40; 
	return positionResult;
}

function division2(position){
	var positionBot = position / 40;
	var positionResult = Math.floor(positionBot);
	return positionResult;
}


// This section is for enemy movement logic using the BFS algorithm. Credit goes to Greg Trowbridge.

// Start location will be in the following format:
// [distanceFromTop, distanceFromLeft]
var findShortestPath = function(startCoordinates) {
  var distanceFromBottom = startCoordinates[1];
  var distanceFromLeft = startCoordinates[0];

  // Each "location" will store its coordinates
  // and the shortest path required to arrive there
  var location = {
    distanceFromBottom: distanceFromBottom,
    distanceFromLeft: distanceFromLeft,
    path: [],
    status: 'Start'
  };

  // Initialize the queue with the start location already inside
  var queue = [location];

  // Loop through the grid searching for the goal
  while (queue.length > 0) {
    // Take the first location off the queue
    var currentLocation = queue.shift();

    // Explore North
    var newLocation = exploreInDirection(currentLocation, 'North');
    if (newLocation.status === 'Goal') {
      return newLocation.path;
    } else if (newLocation.status === 'Valid') {
      queue.push(newLocation);
    }

    // Explore East
    var newLocation = exploreInDirection(currentLocation, 'East');
    if (newLocation.status === 'Goal') {
      return newLocation.path;
    } else if (newLocation.status === 'Valid') {
      queue.push(newLocation);
    }

    // Explore South
    var newLocation = exploreInDirection(currentLocation, 'South');
    if (newLocation.status === 'Goal') {
      return newLocation.path;
    } else if (newLocation.status === 'Valid') {
      queue.push(newLocation);
    }

    // Explore West
    var newLocation = exploreInDirection(currentLocation, 'West');
    if (newLocation.status === 'Goal') {
      return newLocation.path;
    } else if (newLocation.status === 'Valid') {
      queue.push(newLocation);
    }
  }

  // No valid path found
  return false;

};

// This function will check a location's status
// (a location is "valid" if it is on the grid, is not an "obstacle",
// and has not yet been visited by our algorithm)
// Returns "Valid", "Invalid", "Blocked", or "Goal"
var locationStatus = function(location) {
  var gridSize = gameArray.length;
  var dfb = location.distanceFromBottom;
  var dfl = location.distanceFromLeft;

  if (location.distanceFromLeft < 0 ||
      location.distanceFromLeft >= gridSize ||
      location.distanceFromBottom < 0 ||
      location.distanceFromBottom >= gridSize) {

    // location is not on the grid--return false
    return 'Invalid';
  } else if (gameArray[dfb][dfl] === 'Goal') {
    return 'Goal';
  } else if (gameArray[dfb][dfl] !== 'Empty') {
    // location is either an obstacle or has been visited
    return 'Blocked';
  } else {
    return 'Valid';
  }
};


// Explores the grid from the given location in the given
// direction
var exploreInDirection = function(currentLocation, direction) {
  var newPath = currentLocation.path.slice();
  newPath.push(direction);

  var dfb = currentLocation.distanceFromBottom;
  var dfl = currentLocation.distanceFromLeft;

  if (direction === 'North') {
    dfb += 1;
  } else if (direction === 'East') {
    dfl += 1;
  } else if (direction === 'South') {
    dfb -= 1;
  } else if (direction === 'West') {
    dfl -= 1;
  }

  var newLocation = {
    distanceFromBottom: dfb,
    distanceFromLeft: dfl,
    path: newPath,
    status: 'Unknown'
  };
  newLocation.status = locationStatus(newLocation);

  // If this new location is valid, mark it as 'Visited'
  if (newLocation.status === 'Valid') {
    gameArray[newLocation.distanceFromBottom][newLocation.distanceFromLeft] = 'Visited';
  }

  return newLocation;
};
