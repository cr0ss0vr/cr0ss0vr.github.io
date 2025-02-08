// JavaScript Document
// Variable list
{
var boxWidth = 1280;
var boxHeight = 720;
var ctx;
var canvas;
var refreshRate = 15;
var loopsPerSec = 1000/refreshRate;
var dOffset = 75;
var offsetTop = 300;
var menuItemX;
var isNewGame = true;
var isPaused = false;
var menuOptions = ["New Game", "Controls", "Options"];
var menuHitBox = Create2DArray(menuOptions.length,4);
var debug = true;
var titleFont = "80px Vollkorn";
var bodyFont = "35px Vollkorn";
var ingameFont = "25px Vollkorn";
var guiFont = "19px Vollkorn";

var curGameState = 0;

//CONSTANT VARs, DO NOT CHANGE.
var GAMESTATE_MAINMENU=0;
var GAMESTATE_INGAME=1;
var GAMESTATE_RESPAWNING=2;
var GAMESTATE_PAUSED=3;
var GAMESTATE_CONTROLS=4;
var GAMESTATE_OPTIONS=5;
var GAMESTATE_GAME_OVER=6;

var playerImg = new Image();
var pRipple00 = new Image();
var pRipple01 = new Image();
var pRipple02 = new Image();
var pRipple03 = new Image();
var pRipple04 = new Image();

var merchImg = new Image();
var ripple00 = new Image();
var ripple01 = new Image();
var ripple02 = new Image();
var ripple03 = new Image();
var ripple04 = new Image();

var island01 = new Image();
var turretImg = new Image();
var blankImg = new Image();
var shellImg = new Image();
var crateImg = new Image();

var	explosion00 = new Image();
var	explosion01 = new Image();
var	explosion02 = new Image();
var	explosion03 = new Image();
var	explosion04 = new Image();
var	explosion05 = new Image();
var	explosion06 = new Image();
var	explosion07 = new Image();

var explosion = {
	frame:0,
	timeSinceFrameChange:0,
	x:0,
	y:0,
	img:new Image()
};

var restriction = {
	top:false,
	bot:false,
	left:false,
	right:false
};

var sky = {
	x:0,
	y:0,
	enabled:true,
	img:new Image()
};

var moneyTimer = 3*loopsPerSec;
var respawnTimer = 1*loopsPerSec;
var spawnTimer = 10*loopsPerSec;
var islandTimer = 25*loopsPerSec;
var reloadTimer = 1*loopsPerSec;
var npcReloadTimer = 2*loopsPerSec;

var water = {
	x:0,
	y:0,
	enabled:true,
	img:new Image()
};


var mouse = {
	x:null,
	y:null
};

var mouseClick = {
	x:null,
	y:null	
};

var KEY = {
	UP: 87,
	DOWN: 83,
	LEFT: 65,
	RIGHT: 68
};

//create the array of ships
var gameObjects = [];

var pressedKeys = [];
}

//Automatically called function once page is loaded
$(function(){ 
	"use strict";
	console.log("Initialising");
	//get the canvas which is the drawing area on the web page. it is a container
	canvas = document.getElementById('canvas');
	//get the 2d drawing ctx for the canvas
	ctx = canvas.getContext('2d');
	 
	boxWidth = ctx.canvas.width;
	boxHeight = ctx.canvas.height;
	water.img.onload = function(){
		//setInterval will attempt to run the code every X milliseconds.
		setInterval(mainLoop,refreshRate); 
	};
	$(document).keydown(function(e){
		pressedKeys[e.which] = true;
	});
	$(document).keyup(function(e){
		pressedKeys[e.which] = false;
	});
	canvas.addEventListener("mousemove", trackPosition, false);
	canvas.addEventListener("mousedown", mouseclick, false);
	loadImages();
	loadSound();
	initGame();
});

function loadImages(){
	"use strict";
	console.log("Loading Images");
	sky.img.src = "img/sky.png";
	water.img.src = "img/water.jpg";
	
	explosion00.src = "img/blank.png";
	explosion01.src = "img/explosion/explosion01.png";
	explosion02.src = "img/explosion/explosion02.png";
	explosion03.src = "img/explosion/explosion03.png";
	explosion04.src = "img/explosion/explosion04.png";
	explosion05.src = "img/explosion/explosion05.png";
	explosion06.src = "img/explosion/explosion06.png";
	explosion07.src = "img/blank.png";
	
	playerImg.src = "img/player/ship.png";
	pRipple00.src = "img/player/ripple00.png";
	pRipple01.src = "img/player/ripple01.png";
	pRipple02.src = "img/player/ripple02.png";
	pRipple03.src = "img/player/ripple03.png";
	pRipple04.src = "img/player/ripple04.png";
	
	merchImg.src = "img/npc/ship.png";
	ripple00.src = "img/npc/ripple00.png";
	ripple01.src = "img/npc/ripple01.png";
	ripple02.src = "img/npc/ripple02.png";
	ripple03.src = "img/npc/ripple03.png";
	ripple04.src = "img/npc/ripple04.png";
	
	island01.src = "img/island01.png";
	turretImg.src = "img/turret.png";
	shellImg.src = "img/shell.png";
	crateImg.src = "img/crate.png";
	
	blankImg.src = "img/blank.png";
	
	console.log("Images Loaded");
}

function loadSound(){
	"use strict";
	console.log("Loading sound");
}

function initGame(){
	"use strict";
	isNewGame = true;
}

//Main
function mainLoop(){
	"use strict";
	clear();
	drawSea();
	gameStateControl();
	menuActions();
	drawMenu();
	if(sky.enabled){
		drawSky();
	}
	clearMouseClick();
}

function resetAllVars(){
	"use strict";
	dOffset = 75;
	offsetTop = 300;
	menuItemX = 0;
	
	spawnTimer = 1*loopsPerSec;
	islandTimer = 1*loopsPerSec;

	isNewGame = true;
	isPaused = false;
	
	restriction = {
		top:false,
		bot:false,
		left:false,
		right:false
	};

	gameObjects = [];
	spawnPlayer();
	
}

function spawnPlayer(){
	"use strict";
	var player = {
		object:"player",
		explode:false,
		deleting:false,
		lives:3,
		hp:100,
		score:0,
		canShoot: true,
		img: playerImg,
		tImg: turretImg,
		ripple:pRipple00,
		tAngle: 0,
		x:(boxWidth / 2) - ( playerImg.width / 2),
		y:(boxHeight / 2) - ( playerImg.height / 2),
		midX: (boxWidth / 2) - ( playerImg.width / 2) +(playerImg.width/2),
		midY: (boxHeight / 2) - ( playerImg.height / 2) +(playerImg.height/2),
		tXMount:0,
		tYMount:0,
		tXMidMount:0,
		tYMidMount:0,
		tXMountOffset: 80,
		tYMountOffset: -10,
		rippleOffset: {
			x:57,
			y:21
		}
	};
	player.tXMount = player.x + player.tXMountOffset;
	player.tYMount = player.y + player.tYMountOffset;
	player.tXMidMount = player.x + player.tXMountOffset+(turretImg.width/2);
	player.tYMidMount = player.y + player.tYMountOffset+10;
	gameObjects.push(player);
}

function respawn(){
	"use strict";
	gameObjects[0].explode = false;
	gameObjects[0].hp = 100;
	gameObjects[0].x = (boxWidth / 2) - ( playerImg.width / 2);
	gameObjects[0].y = (boxHeight / 2) - ( playerImg.height / 2);
	respawnTimer = 1*loopsPerSec;
	moneyTimer = 3*loopsPerSec;
	curGameState = GAMESTATE_INGAME;
}

function spawnNPC(){
	"use strict";
	var tempY = getRand(merchImg.height, (720-merchImg.height));
	var randScore = getRand(10,100);
	var merchShip = {
		object:"npc",
		explode:false,
		deleting:false,
		lives:1,
		hp:100,
		score:randScore,
		img: merchImg,
		tImg: turretImg,
		ripple:ripple00,
		canShoot: true,
		x:1280,
		y:tempY,
		midX: 1280 +(merchImg.width/2),
		midy: tempY +(merchImg.height/2),
		tXMount: 0,
		tYMount: 0,
		tXMountOffset: 38,
		tYMountOffset: -3,
		rippleOffset: {
			x:10,
			y:6
		}
	};
	
	merchShip.tXMount = merchShip.x + merchShip.tXMountOffset;
	merchShip.tYMount = merchShip.y + merchShip.tYMountOffset;
	
	gameObjects.push(merchShip);
	spawnTimer = 10*loopsPerSec;
}

function spawnIsland(){
	"use strict";
	var tempY = getRand(merchImg.height, (720-merchImg.height));
	var randImgVal = getRand(1,1);
	var randImg = "island0"+randImgVal;
	var islandImg;
	switch(randImg){
		case "island01":
			islandImg = island01;
			break;
	}
	var island = {
		object:"island",
		deleting:false,
		lives: 9999,
		score: 0,
		img: islandImg,
		ripple:blankImg,
		x:1280,
		y:tempY,
		rippleOffset:{
			x:0,
			y:0
		}
	};
	gameObjects.push(island);
	islandTimer = 35*loopsPerSec;
}

function gameLogic(){
	"use strict";
	if(isNewGame){
		resetAllVars();
		isNewGame = false;
	}
	
	spawnTimer--;
	islandTimer--;
	moneyTimer--;
	
	if(moneyTimer <= 0){
		gameObjects[0].score++;
		moneyTimer = 3*loopsPerSec;
	}
	
	if(spawnTimer <= 0){
		spawnNPC();
	}
	if(islandTimer <= 0){
		spawnIsland();
	}
	if(respawnTimer <= 0){
		respawn();
	}
	if(curGameState !== GAMESTATE_RESPAWNING){
		gameObjects.forEach(update);
	}
	if(curGameState === GAMESTATE_RESPAWNING){
		respawnTimer--;
		update(gameObjects[0],0,[]);
	}
}

function update(element, index, array){
	"use strict";
	animateExplosion();
	objectCleanup(index);
	switch(element.object){
		case "player"://if its the player ship
			if(curGameState !== GAMESTATE_RESPAWNING){
				controls(element);
			}
			checkRestrictions(element);
			
			if(!element.canShoot){
				if(reloadTimer <= 0){
					element.canShoot = true;
				}else{
					reloadTimer--;
				}
			}else{
				reloadTimer = 1*loopsPerSec;
			}
			
			element.tXMidMount = element.x + 93;
			element.tYMidMount = element.y + 20;
			
			if(element.ripple === pRipple00){
				element.ripple = pRipple04;
			}
			if(element.ripple === pRipple01){
				element.ripple = pRipple00;
			}
			if(element.ripple === pRipple02){
				element.ripple = pRipple01;
			}
			if(element.ripple === pRipple03){
				element.ripple = pRipple02;
			}
			if(element.ripple === pRipple04){
				element.ripple = pRipple03;
			}
			
			break;
		case "npc"://if its an npc ship
			npcControls(index);
			npcEffectsLives(index);
			
			element.tXMidMount = element.x + 53;
			element.tYMidMount = element.y + 27;
						
			if(element.ripple === ripple00){
				element.ripple = ripple04;
			}
			if(element.ripple === ripple01){
				element.ripple = ripple00;
			}
			if(element.ripple === ripple02){
				element.ripple = ripple01;
			}
			if(element.ripple === ripple03){
				element.ripple = ripple02;
			}
			if(element.ripple === ripple04){
				element.ripple = ripple03;
			}
			break;
		case "island":
			islandFloat(element);
			break;
		case "bullet":
			element.x += element.dx;
			element.y += element.dy;
			element.ttl++;
			break;
	}
	if(curGameState !== GAMESTATE_RESPAWNING){
		collisionCheck();
		drawGUI(element);
	}
	renderGameObjects(element);
	if(element.object !== "island" && element.object !== "bullet"){
		renderPlayerTurret(element);
	}
}

function animateExplosion(){
	"use strict";
	
	switch(explosion.frame){
		case 0:
			explosion.img = explosion00;
			if(explosion.timeSinceFrameChange === 15){
				explosion.frame = 1;
				explosion.timeSinceFrameChange = 0;
			}
			break;
		case 1:
			explosion.img = explosion01;
			if(explosion.timeSinceFrameChange === 15){
				explosion.frame = 2;
				explosion.timeSinceFrameChange = 0;
			}
			break;
		case 2:
			explosion.img = explosion02;
			if(explosion.timeSinceFrameChange === 15){
				explosion.frame = 3;
				explosion.timeSinceFrameChange = 0;
			}
			break;
		case 3:
			explosion.img = explosion03;
			if(explosion.timeSinceFrameChange === 15){
				explosion.frame = 4;
				explosion.timeSinceFrameChange = 0;
			}
			break;
		case 4:
			explosion.img = explosion04;
			if(explosion.timeSinceFrameChange === 15){
				explosion.frame = 5;
				explosion.timeSinceFrameChange = 0;
			}
			break;
		case 5:
			explosion.img = explosion05;
			if(explosion.timeSinceFrameChange === 15){
				explosion.frame = 6;
				explosion.timeSinceFrameChange = 0;
			}
			break;
		case 6:
			explosion.img = explosion06;
			if(explosion.timeSinceFrameChange === 15){
				explosion.frame = 7;
				explosion.timeSinceFrameChange = 0;
			}
			break;
		case 7:
			explosion.img = explosion07;
			if(explosion.timeSinceFrameChange === 15){
				explosion.frame = 0;
				explosion.timeSinceFrameChange = 0;
			}
			break;
	}
}

function objectCleanup(index){
	"use strict";
	
	if(gameObjects[index].object === "bullet"){
		if(gameObjects[index].ttl >= gameObjects[index].lifeSpan){
			gameObjects[index].deleting = true;
		}
	}
	
	if(gameObjects[index].deleting === true){
		gameObjects.splice(index,1);
	}
}

function islandFloat(element){
	"use strict";
	if(element.x + element.img.width < 0){
		element.deleting = true;
	}else{
		element.x -= 0.5;
	}
}

function collisionCheck(){
	"use strict";
	//find if something has hit the current object
	for(var oneIndex = 0; oneIndex < gameObjects.length; oneIndex++){
		for(var twoIndex = 0; twoIndex < gameObjects.length; twoIndex++){
			if(gameObjects[oneIndex] !== gameObjects[twoIndex]){
				var one = gameObjects[oneIndex];
				var two = gameObjects[twoIndex];
					
				if(one.object === "bullet" && two.object === "bullet"){
					break;
				}
				var hit = actualCheck(one, two);
				if(hit){
					console.log(oneIndex + " " + one.object + " has hit " + (twoIndex) + " " + two.object);
					//if something has, take hp from it (if its not a island, dont)
					
					if(one.object === "player" && two.object === "island"){
						one.hp--;
						one.explode = true;
						if(one.hp <= 0){
							one.lives--;
							if(one.lives < 0){
								curGameState = GAMESTATE_GAME_OVER;
							}else{
								curGameState = GAMESTATE_RESPAWNING;
							}
						}
						break;
					}
					
					if(one.object === "island" && two.object === "player"){
						two.hp--;
						two.explode = true;
						if(two.hp <= 0){
							two.lives--;
							if(two.lives < 0){
								curGameState = GAMESTATE_GAME_OVER;
							}else{
								curGameState = GAMESTATE_RESPAWNING;
							}
						}
						break;
					}
					
					if(one.object === "player" && two.object === "npc"){
						one.hp--;
						one.explode = true;
						two.hp--;
						two.explode = true;
						if(two.hp <= 0){
							two.lives--;
							two.deleting = true;	
						}
						if(one.hp <= 0){
							one.lives--;
							if(one.lives < 0){
								curGameState = GAMESTATE_GAME_OVER;
							}else{
								curGameState = GAMESTATE_RESPAWNING;
							}
						}
						break;
					}
					
					if(one.object === "npc" && two.object === "player"){
						one.hp--;
						one.explode = true;
						two.hp--;
						two.explode = true;
						if(two.hp <= 0){
							two.lives--;
							if(two.lives < 0){
								curGameState = GAMESTATE_GAME_OVER;
							}else{
								curGameState = GAMESTATE_RESPAWNING;
							}	
						}
						if(one.hp <= 0){
							one.lives--;
							one.deleting = true;
						}
						break;
					}
					
					if(one.object === "npc" && two.object === "island"){
						one.hp--;
						one.explode = true;
						if(one.hp <= 0){
							one.lives--;
							if(one.lives < 0){
								one.deleting = true;	
							}
						}
						break;
					}
					
					if(one.object === "island" && two.object === "npc"){
						two.hp--;
						two.explode = true;
						if(two.hp <= 0){
							two.lives--;
							if(two.lives < 0){
								two.deleting = true;	
							}
						}
						break;
					}
						
					if(one.object === "npc" && two.object === "npc"){
						one.hp--;
						one.explode = true;
						two.hp--;
						two.explode = true;
						if(two.hp <= 0){
							two.lives--;
							if(two.lives < 0){
								two.deleting = true;	
							}
						}
						if(one.hp <= 0){
							one.lives--;
							if(one.lives < 0){
								one.deleting = true;	
							}
						}
						break;
					}
					if(one.object === "bullet" && two.object === "npc" && two.object !== one.origin){
						one.ttl=one.lifeSpan;
						if(one.origin !== two.object){
							two.hp-=5;
							gameObjects[0].score+=5;
							if(two.hp <= 0){
								two.lives--;
								if(two.lives < 0){
									gameObjects[0].score+=10;
									two.deleting = true;	
								}
							}
						}
						break;
					}
					if(two.object === "bullet" && one.object === "npc" && one.object !== two.origin){
						two.ttl=two.lifeSpan;
						if(two.origin !== one.object){
							one.hp-=5;
							gameObjects[0].score+=5;
							if(one.hp <= 0){
								one.lives--;
								if(one.lives < 0){
									gameObjects[0].score+=10;
									one.deleting = true;	
								}
							}
						}
						break;
					}
					if(one.object === "bullet" && two.object === "player" && two.object !== one.origin){
						one.ttl=one.lifeSpan;
						two.hp--;
						two.explode = true;
						if(two.hp <= 0){
							two.lives--;
							if(two.lives < 0){
								curGameState = GAMESTATE_GAME_OVER;
							}else{
								curGameState = GAMESTATE_RESPAWNING;
							}
						}
						break;
					}
					if(two.object === "bullet" && one.object === "player" && one.object !== two.origin){
						two.ttl=two.lifeSpan;
						one.hp-=5;
						one.explode = true;
						if(one.hp <= 0){
							one.lives--;
							if(one.lives < 0){
								curGameState = GAMESTATE_GAME_OVER;
							}else{
								curGameState = GAMESTATE_RESPAWNING;
							}
						}
						break;
					}
				}
			}
		}
	}	
}

function actualCheck(one, two){
	"use strict";
	
	if(debug){
		ctx.lineWidth = 1;
		ctx.strokeStyle = 'black';
		ctx.strokeRect(one.x, one.y, one.img.width, one.img.height);
		ctx.strokeRect(two.x, two.y, two.img.width, two.img.height);
	}
	
	if(one.x+one.img.width>two.x){
		//one's right side has passed two's left side
		if(one.y < two.y + two.img.height){
			//and one's top side passed two's bottom side
			if(one.x>two.x+two.img.width){
				//but, one's left side is outside of the right side
				return false;
			}else{
				if(one.y + one.img.height < two.y){
					//but one's bottom side is outside two's top side
					return false;
				}else{
					return true;
				}
			}
		}
	}
	
	return false;
}
//ingame controls
function controls(player){
	"use strict";
	
	if(player.canShoot){
		if(mouseClick.x !== null){
			fireBullet(player);
			player.canShoot = false;
			clearMouseClick();
		}
	}
	
	if(pressedKeys[KEY.UP]){
		if(!restriction.top){
			player.y -= 1;
		}
	}else if(pressedKeys[KEY.DOWN])
	{
		if(!restriction.bot){
			player.y += 1; 	
		}
	}
	if(pressedKeys[KEY.LEFT]){
		if(!restriction.left){
			player.x -= 1;
		}
	}else if(pressedKeys[KEY.RIGHT])
	{
		if(!restriction.right){
			player.x += 1;
		}
	}else{
		if(!restriction.right){
			player.x -=0.3;
		}
	}
}

function fireBullet(element){
	"use strict";
	var newObject = {
		object: "bullet",
		deleting: false,
		origin: element.object,
		img: shellImg,
		lifeSpan: 3*loopsPerSec,
		ripple:blankImg,
		ttl: 0,
		dx: 3 * Math.cos(element.tAngle),
		dy: 3 * Math.sin(element.tAngle),
		x: element.tXMidMount,
		y: element.tYMidMount,
		rippleOffset:{
			x:0,
			y:0
		}
	};
	gameObjects.push(newObject);
}

function checkRestrictions(player){
	"use strict";
	if(player.x < -5){
		player.x = -5;
		restriction.left = true;
	}else if(player.x > (1280-player.img.width)){
		player.x = (1280-player.img.width);
		restriction.right = true;
		restriction.left = false;
	}else{
		restriction.left = false;
		restriction.right = false;
	}
	
	if(player.y <= -5){
		player.y = -4;
		restriction.top = true;
	}else if(player.y >= (720-player.img.height)){
		player.y = (719-player.img.height);
		restriction.bot = true;
		restriction.top = false;
	}else{
		restriction.top = false;
		restriction.bot = false;
	}
}

function npcControls(index){
	"use strict";
	gameObjects[index].x -=1.5;
	npcReloadTimer--;
	if(npcReloadTimer <= 0){
		fireBullet(gameObjects[index]);
		npcReloadTimer = 2*loopsPerSec;
	}
}

function npcEffectsLives(index){
	"use strict";
	if((gameObjects[index].x + ripple00.width <= 0) && (!gameObjects[index].deleting)){
		gameObjects[0].lives--;
		if(gameObjects[0].lives < 0){
			curGameState = GAMESTATE_GAME_OVER;
		}
		gameObjects[index].deleting = true;
	}
}

function menuActions(){
	"use strict";
	switch (curGameState){
		case GAMESTATE_MAINMENU:
			isNewGame = true;
			menuOptions = ["New Game", "Controls", "Options"];
			offsetTop = 300; 
			isPaused = false;
			break;
		case GAMESTATE_RESPAWNING:
		case GAMESTATE_INGAME:
			gameLogic();
			offsetTop = 20;	
			menuOptions = ["Pause"];
			break;
		case GAMESTATE_PAUSED:
			isPaused = true;
			menuOptions = ["Resume", "Controls", "Options", "Main Menu"];
			offsetTop = 270;
			break;
		case GAMESTATE_CONTROLS:
			offsetTop = 270;
			if(isPaused){
				menuOptions = ["Back",
					"Up = " + String.fromCharCode(KEY.UP),
					"Down = " + String.fromCharCode(KEY.DOWN),
					"Left = " + String.fromCharCode(KEY.LEFT),
					"Right = " + String.fromCharCode(KEY.RIGHT),
					"Main Menu"
				];
			}else{
				menuOptions = [
					"Up = " + String.fromCharCode(KEY.UP),
					"Down = " + String.fromCharCode(KEY.DOWN),
					"Left = " + String.fromCharCode(KEY.LEFT),
					"Right = " + String.fromCharCode(KEY.RIGHT),
					"Main Menu"
				];
			}
			break;
		case GAMESTATE_OPTIONS:
			offsetTop = 270;
			if(isPaused){
				menuOptions = ["Back", "Debug = " + debug, "Sky = " + sky.enabled, "Moving Water = " +water.enabled/*, "Options", "Here"*/];
			}else{
				menuOptions = ["Debug = " + debug, "Sky = " + sky.enabled, "Moving Water = " +water.enabled/*, "Options", "Here"*/, "Main Menu"];
			}
			break;
		case GAMESTATE_GAME_OVER:
			offsetTop = 300;
			menuOptions = ["You Scored:  " +gameObjects[0].score ,"Main Menu"]; //display the score and the quit option.
			break;
	}
}

function drawGUI(element){
	"use strict";
	
	ctx.lineWidth = 1;
	ctx.strokeStyle = "black";
	ctx.fillStyle = "white";
	
	ctx.fillRect(element.x, element.y-10, (element.hp / 100)*element.img.width, 5);
	ctx.strokeRect(element.x, element.y-10, (element.hp / 100)*element.img.width, 5);
	
	ctx.font = guiFont;
	ctx.fillText("Lives: " + gameObjects[0].lives, gameObjects[0].x, gameObjects[0].y-15, boxWidth);
	ctx.strokeText("Lives: " + gameObjects[0].lives, gameObjects[0].x, gameObjects[0].y-15, boxWidth);
	
	ctx.fillText("Score: " + gameObjects[0].score, gameObjects[0].x, gameObjects[0].y+55, boxWidth);
	ctx.strokeText("Score: " + gameObjects[0].score, gameObjects[0].x, gameObjects[0].y+55, boxWidth);
	
}

//Menu Drawing
function drawMenu(){
	"use strict";
	var tOffset = offsetTop;
	ctx.fillStyle = "white";
	ctx.lineWidth = 1.2;
	ctx.strokeStyle = "black";
	menuItemX = boxWidth * 0.5;
	switch (curGameState){
		case GAMESTATE_MAINMENU:
			ctx.font = titleFont;
			ctx.fillText("Main Menu", (menuItemX - (ctx.measureText("Main Menu").width) * 0.5), 90, boxWidth);
			ctx.strokeText("Main Menu", (menuItemX - (ctx.measureText("Main Menu").width) * 0.5), 90, boxWidth);
			break;
		case GAMESTATE_RESPAWNING:
		case GAMESTATE_INGAME:
			menuItemX = boxWidth * 0.96;
			break;
		case GAMESTATE_PAUSED:
			ctx.font = titleFont;
			ctx.fillText("Paused", (menuItemX -(ctx.measureText("Paused").width) * 0.5), 90, boxWidth);
			ctx.strokeText("Paused", (menuItemX -(ctx.measureText("Paused").width) * 0.5), 90, boxWidth);
			break;
		case GAMESTATE_CONTROLS:
			ctx.font = titleFont;
			ctx.fillText("Controls", (menuItemX - (ctx.measureText("Controls").width) * 0.5), 90, boxWidth);
			ctx.strokeText("Controls", (menuItemX - (ctx.measureText("Controls").width) * 0.5), 90, boxWidth);
			break;
		case GAMESTATE_OPTIONS:
			ctx.font = titleFont;
			ctx.fillText("Options", (menuItemX - (ctx.measureText("Options").width) * 0.5), 90, boxWidth);
			ctx.strokeText("Options", (menuItemX - (ctx.measureText("Options").width) * 0.5), 90, boxWidth);
			break;
		case GAMESTATE_GAME_OVER:
			ctx.font = titleFont;
			ctx.fillText("Game Over", (menuItemX - (ctx.measureText("Game Over!").width) * 0.5), 90, boxWidth);
			ctx.strokeText("Game Over", (menuItemX - (ctx.measureText("Game Over!").width) * 0.5), 90, boxWidth);
			break;
	}
	
	for(var index = 0; index < menuOptions.length; index++){ //iterate all elements of menuOptions
		if(menuOptions[index] !== "Pause"){
			ctx.font = bodyFont;
		}else{
			ctx.font = ingameFont;
		}
		ctx.fillText(menuOptions[index],(menuItemX - (ctx.measureText(menuOptions[index]).width) * 0.5), tOffset, boxWidth);//draw them
		ctx.strokeText(menuOptions[index],(menuItemX - (ctx.measureText(menuOptions[index]).width) * 0.5), tOffset, boxWidth);//draw them
		tOffset = tOffset + dOffset;//increment total offset by the offset distance	
	}
}

//Menu controls
function gameStateControl(){ 
	"use strict";
	var tOffset = offsetTop;
	
	for(var index = 0; index < menuOptions.length; index++){ //draw all elements of menuOptions
		menuHitBox[index,0] = (menuItemX - (ctx.measureText(menuOptions[index]).width) * 0.5) - 5;
		menuHitBox[index,1] = tOffset - 30;
		menuHitBox[index,2] = ctx.measureText(menuOptions[index]).width+10;
		menuHitBox[index,3] = 40;
		
		if(debug){//draw the hitbox for the gameState items
			ctx.lineWidth = 1;
			ctx.strokeStyle = 'black';
			if(menuOptions[index].indexOf("You Scored: ") === -1){ //the only non-clickable thing shouldnt have a hitbox, the endgame score.
				ctx.strokeRect(menuHitBox[index,0], menuHitBox[index,1], menuHitBox[index,2], menuHitBox[index,3]);	
			}
		}
		if(((mouse.x > menuHitBox[index,0]) && (mouse.x < menuHitBox[index,0] + menuHitBox[index,2])) && ((mouse.y > menuHitBox[index,1]) && (mouse.y < menuHitBox[index,1] + menuHitBox[index,3]))){	//check the pre-generated array for the x and width, and y and height
			if(mouseClick.x !==  0 && mouseClick.x !==  null ){ //check if the mouse has been clicked and in what position
				console.log("X: " + menuHitBox[index,0] + ". Y: " + menuHitBox[index,2] + ".");
				console.log("Game state: " + curGameState);
				console.log("clicked " + menuOptions[index] + ". Option: " + index);
				
				switch (menuOptions[index]){
					case "Main Menu":
						curGameState = GAMESTATE_MAINMENU;
						break;
					case "Resume":
					case "New Game":
						curGameState = GAMESTATE_INGAME;
						break;
					case "Pause":
						curGameState = GAMESTATE_PAUSED;
						break;
					case "Load":
						curGameState = GAMESTATE_LOADMENU;
						break;
					case "Controls":
						curGameState = GAMESTATE_CONTROLS;
						break;
					case "Options": 
						curGameState = GAMESTATE_OPTIONS;
						break;
					case "Save": 
						curGameState = GAMESTATE_SAVEMENU;
						break;
					case "Back":
						curGameState = GAMESTATE_PAUSED;
						break;
					case "Debug = false":
						debug = true;
						break;
					case "Debug = true":
						debug = false;
						break;
					case "Sky = false":
						sky.enabled = true;
						break;
					case "Sky = true":
						sky.enabled = false;
						break;
					case "Moving Water = true":
						water.enabled  = false;
						break;
					case "Moving Water = false":
						water.enabled  = true;
						break;
				}
				clearMouseClick();
			}
		}
	tOffset = tOffset + dOffset;//increment total offset by the offset distance
	}
}

function renderGameObjects(element){
	"use strict";
	drawImg(element.ripple, element.x - element.rippleOffset.x, element.y - element.rippleOffset.y);
	drawImg(element.img, element.x, element.y);
	
	if(element.explode === true){
		console.log(element.object + " should be exploding");
		explosion.timeSinceFrameChange++;
		drawImg(explosion.img, element.x-60, element.y-60);
		if(explosion.frame === 7){
			element.explode = false;
		}
	}
}
 
function renderPlayerTurret(element) {
	"use strict";
	var point2 = {
		x: Math.round(element.tXMidMount),
		y: Math.round(element.tYMidMount)
	};	
	var point1 = {
		x: 0,
		y: 0
	};		
	if(element.object === "player"){
		point1.x = mouse.x;
		point1.y = mouse.y;
	}
	if(element.object === "npc"){
		point1.x = gameObjects[0].tXMidMount;
		point1.y = gameObjects[0].tYMidMount;
	}
	
	//transformation
	var deltaX = point1.x - point2.x;
	var deltaY = point1.y - point2.y;
	element.tAngle = Math.atan2(deltaY, deltaX);
	ctx.save(); //save current state in stack d
	
	//translate the canvas origin to the center of the player
	ctx.translate(element.tXMidMount, element.tYMidMount);
	ctx.rotate(element.tAngle);
	
	drawImg(element.tImg, 0-30, 0-16);

	//restore context
	ctx.restore(); //pop old state on to screen
}
//MouseClick
function mouseclick(e){
	"use strict";
	var rect = canvas.getBoundingClientRect();
	if (e.x !==  undefined && e.y !==  undefined){
		mouseClick.x = e.x - rect.left;
		mouseClick.y = e.y - rect.top;
	}else{ // Firefox method to get the position
		mouseClick.x = e.clientX - rect.left;
		mouseClick.y = e.clientY - rect.top;
	}
	console.log("X: " + mouseClick.x + " . Y: " + mouseClick.y);
}
//position
function trackPosition(e) {
	"use strict";
	var rect = canvas.getBoundingClientRect();
	if (e.x !==  undefined && e.y !==  undefined){
		mouse.x = e.x - rect.left;
		mouse.y = e.y - rect.top;
	}else{ // Firefox method to get the position
		mouse.x = e.clientX - rect.left;
		mouse.y = e.clientY - rect.top;
	}
}
//clear Mouseclick
function clearMouseClick(){
	"use strict";
	mouseClick.x = null;
	mouseClick.y = null;
}
//Draw image functions
function drawImg(img, x, y, w, h){ // quick draw function to iliminate the need for "ctx."
	"use strict";
	if(typeof w === "undefined" || typeof h === "undefined"){//added this conditional to simulate overloading
		ctx.drawImage(img, x, y);
	}else{
		ctx.drawImage(img, x, y, w, h);
	}
}
//Floor
function drawSea(){
	"use strict";
	var x = 0, y = 0;
	for(x = -640; x < 1408; x += 64){
		for(y = -640; y < 848; y += 64){
			drawImg(water.img, water.x+x, water.y+y);
		}
	}
	if(water.enabled)
	{
		water.x-=0.5;
	}
	if(water.x <= -128){
		water.x = 0;
	}
}
//Sky
function drawSky(){	
	for(x = 0; x < 2560; x += 1280){
		for(y = -720; y < 720; y += 720){
			drawImg(sky.img, sky.x+x, sky.y+y);
		}
	}
	if(sky.x <= -1280){
		sky.x = 0
	}else{
		sky.x -= 1.5;
	}
	if(sky.y >=  720){
		sky.y = 0;
	}else{
		sky.y += 0.75;
	}
}
//Clear whole canvas
function clear() {	
	ctx.clearRect(0, 0, boxWidth, boxHeight); 
}
//Get random number
function getRand(min, max){
	return Math.floor(Math.random() * (max - min)) + min;
}
//2D Array creation
function Create2DArray(rows,columns) {
   var x = new Array(rows);
   for (var i = 0; i < rows; i++) {
       x[i] = new Array(columns);
   }
   return x;
}