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
				$('.roleInfo').html(templateAttackerInfo);
				$('.roleInfo').find($('.roadCount')).html(roadCount);
				detectTurnButtons();
    })
    
    socket.on('defender', function(data){
    		$('.roleChoice').remove();
    		role = data;
 				$('.roleInfo').html(templateDefenderInfo);
				$('.roleInfo').find($('.blockageCount')).html(blockageCount);
				$('.roleInfo').find($('.towerCount')).html(towerCount);				
    })
    
    socket.on('createNewTile', createNewTile);
    
    socket.on('beginGame', beginGame);
    
    socket.on('createNewTower', createNewTower);
    
    socket.on('attackerTurn', attackerTurn);
    
    socket.on('defenderTurn', defenderTurn);
    
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
														
var templateAttackerInfo = "<h2>Info panel for attacker</h2>" +
													 "<h3>Place roads to connect the starting point(bottom left) to end point(top right)</h3>" +
													 "<h3>You can place 5 tiles of road every turn. Click on the road tile to place roads</h3>" +
													 "<h3>Number of Road tiles left:<span class='roadCount'></span></h3>" +
													 "<div class ='attackerStatus'><button class='attackerTurnEnd'>I am done with my turn</button></div>";

var templateDefenderInfo = "<h2>Info panel for defender</h2>" +
													 "<h3>Attacker will place roads to connect the starting point(bottom left) to end point(top right)</h3>" +
													 "<h3>Your job is to place blockages to complicate the path of the enemies and place towers to kill your enemies </h3>" +
													 "<h3>You can place 3 tiles of road every turn. Click on the road tile to place roads</h3>" +
													 "<h3>You can only place towers on blockage tiles. Can only place 2 towers maximum</h3>" +													 
													 "<h3>Number of Blockage tiles left:<span class='blockageCount'></span></h3>" +
													 "<h3>Number of Towers left:<span class='towerCount'></span></h3>" +
													 "<div class='defenderStatus'><h1>Please Wait as the attacker make his move</h1></div>";
													 
var templateAttackerDuringTurn = "<button class='attackerTurnEnd'>I am done with my turn</button>";

var templateDefenderDuringTurn = "<button class ='defenderTurnEnd'>I am done with my turn</button>";

var templateAttackerWaitingForDefender = "<h1>Please Wait as the defender make his move</h1>";

var templateDefenderWaitingForAttacker = "<h1>Please Wait as the attacker make his move</h1>"; 

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
		path = findShortestPath([0,0], gameArray);
}

function createNewTower(data){
		tower = new Tower(data[0] + 20, data[1] + 20);
		towers.push(tower);
}

function attackerTurn(){
		roadCount = 5;
		turn ='attacker';
		$('.attackerStatus').html(templateAttackerDuringTurn);
		$('.roleInfo').find($('.roadCount')).html(roadCount);
		detectTurnButtons();
}

function defenderTurn(){
		blockageCount = 3;
		turn = 'defender';
		$('.defenderStatus').html(templateDefenderDuringTurn);
		$('.roleInfo').find($('.blockageCount')).html(blockageCount);		
		detectTurnButtons();
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

var conditionArray = [];
for(i = 0; i < 15; i++){
	conditionArray[i] = [];
	for (j = 0; j < 15; j++){
		conditionArray[i][j] = "Empty";
	}
}
//starting and end point of the game
gameArray[0][0] = "Start";
gameArray[14][14] = "Goal";
conditionArray[0][0] = "Start";
conditionArray[14][14] = "Goal";

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
//number of roads per turn
var roadCount = 5;
//number of blockages per turn
var blockageCount = 3;
//number of towers per game 
var towerCount = 3;
//decide whos turn is it
var turn ='attacker';


//function to detect buttons that are not in canvas
function detectButtons(){
	$('#road').click(function(){
		if(role === 'attacker'){	
			if(!roadMode){
				roadMode = true;
				mode = 'road';
			}
			else{
				roadMode = false;
			}
		}
		else{
			alert('You need to be attacker to place roads');
		}
	});
	
	$('#blockage').click(function(){
		if(role === 'defender'){
			if(!blockageMode){
				blockageMode = true;
				mode = 'blockage';
				towerMode = false;
			}
			else{
				tileMode = false;
			}
		}
		else{
			alert('You need to be defender to place blockages');
		}
	});
	
	$('#begin').click(function(){
		currentFrameCount = frameCount;
		//socket to begin game
		socket.emit('beginGame', currentFrameCount);
		path = findShortestPath([0,0], gameArray);
	});
	
	$('#tower').click(function(){
		if(role === 'defender'){
			if(!towerMode){
				towerMode = true;
				blockageMode = false;
			}
			else{
				towerMode = false;
			}
		}
		else{
			alert('You need to be defender to place towers');
		}
	});
}
	

$(document).ready(function(){
	detectButtons();
});

function detectTurnButtons(){
		$('.attackerTurnEnd').click(function(){
		$('.attackerStatus').html(templateAttackerWaitingForDefender);
		socket.emit('attackerTurnEnd');
	});
	
	$('.defenderTurnEnd').click(function(){
		$('.defenderStatus').html(templateDefenderWaitingForAttacker);
		socket.emit('defenderTurnEnd');
	});
	if(turn === 'attacker'){
		turn === 'defender';
	}
	else{
		turn === 'attacker'
	}
}


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
			if(gameArray[14- positionY][positionX] ==="Neutral"){;
				if(mode === 'road' && turn === 'attacker'){
					if(roadCount > 0){
						gameArray[14- positionY][positionX] = 'Empty';
						tile = new Tile(pixelPositionX, pixelPositionY, mode);
				    tiles.push(tile);
				    roadCount--;
				    $('.roleInfo').find($('.roadCount')).html(roadCount);						    
						socket.emit('createNewTile', [pixelPositionX, pixelPositionY, mode, positionY, positionX]);
					}
					else{
						alert('You have no more road tiles left');
					}
				}
				else if(mode ==='blockage' && turn ==='defender'){
						conditionArray[14- positionY][positionX] = 'Blockage';
						if(findShortestPath([0,0], conditionArray) === false){
								conditionArray[14- positionY][positionX] = 'Empty';
								alert('Cannot block entire path to end point');
								for(i = 0; i < 15; i++){
									for(j = 0; j < 15; j++){
										if(conditionArray[i][j] === 'Visited'){
											conditionArray[i][j] = 'Empty';											
										}
									}
								}								
						}
						else{
							if(blockageCount > 0){
								tile = new Tile(pixelPositionX, pixelPositionY, mode);
								tiles.push(tile);
								conditionArray[14- positionY][positionX] = 'Blockage';
								gameArray[14- positionY][positionX] = 'Blockage';
								blockageCount--;
								$('.roleInfo').find($('.blockageCount')).html(blockageCount);
								socket.emit('createNewTile', [pixelPositionX, pixelPositionY, mode, positionY, positionX]);				
								for(i = 0; i < 15; i++){
									for(j = 0; j < 15; j++){
										if(conditionArray[i][j] === 'Visited'){
											conditionArray[i][j] = 'Empty';											
										}
									}
								}
							}
							else{
								alert('You have no more Blockage tiles left');
							}
						}
				}
				//socket for tiles
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
				if(towerCount > 0){
					tower = new Tower(pixelPositionX+20, pixelPositionY+20);
					towers.push(tower);
					towerCount--;
					$('.roleInfo').find($('.towerCount')).html(towerCount);
					socket.emit('createNewTower', [pixelPositionX, pixelPositionY]);
				}
				else{
					alert('You have no more towers left');
				}
			}
			else{
				alert('Must build Towers on Blockages!');
			}
		//socket for towers
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
var findShortestPath = function(startCoordinates, grid) {
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
    var newLocation = exploreInDirection(currentLocation, 'North', grid);
    if (newLocation.status === 'Goal') {
      return newLocation.path;
    } else if (newLocation.status === 'Valid') {
      queue.push(newLocation);
    }

    // Explore East
    var newLocation = exploreInDirection(currentLocation, 'East', grid);
    if (newLocation.status === 'Goal') {
      return newLocation.path;
    } else if (newLocation.status === 'Valid') {
      queue.push(newLocation);
    }

    // Explore South
    var newLocation = exploreInDirection(currentLocation, 'South', grid);
    if (newLocation.status === 'Goal') {
      return newLocation.path;
    } else if (newLocation.status === 'Valid') {
      queue.push(newLocation);
    }

    // Explore West
    var newLocation = exploreInDirection(currentLocation, 'West', grid);
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
var locationStatus = function(location, grid) {
  var gridSize = grid.length;
  var dfb = location.distanceFromBottom;
  var dfl = location.distanceFromLeft;

  if (location.distanceFromLeft < 0 ||
      location.distanceFromLeft >= gridSize ||
      location.distanceFromBottom < 0 ||
      location.distanceFromBottom >= gridSize) {

    // location is not on the grid--return false
    return 'Invalid';
  } else if (grid[dfb][dfl] === 'Goal') {
    return 'Goal';
  } else if (grid[dfb][dfl] !== 'Empty') {
    // location is either an obstacle or has been visited
    return 'Blocked';
  } else {
    return 'Valid';
  }
};


// Explores the grid from the given location in the given
// direction
var exploreInDirection = function(currentLocation, direction, grid) {
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
  newLocation.status = locationStatus(newLocation, grid);

  // If this new location is valid, mark it as 'Visited'
  if (newLocation.status === 'Valid') {
    grid[newLocation.distanceFromBottom][newLocation.distanceFromLeft] = 'Visited';
  }

  return newLocation;
};
