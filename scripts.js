let horizontalPos = 0; //horizontal position of player
let verticalPos = 0; //vertical position of player
let alive = 0; //the number of lives the player has left
let score = 0; //the number of points the player has
let highScore = 0; //the highest score the player has achieved\
let forwardSpeed = 0; //speed in px/ms (pixels per millisecond) to move forward (up)
let backSpeed = 0; //speed in px/ms to move back (down)
let leftSpeed = 0; //speed in px/ms to move left
let rightSpeed = 0; //speed in px/ms to move right
let active = false; //if the game is active, off until game starts
let hit = false; //if the block has been hit
let blockSpeed = 0.5; //speed the blocks move, in px/ms
let speed = 1.25; //speed of block in px/ms
let y = 0; //position of gamepiece vertically
let x = 0; //position of gp horizontally
let hitActive = true; //if the obstacles hit the gamepiece
let battery = 70; //Amount of battery that the drone has (0 - 70)
let hsLocal = false; //Store highscore locally instead of on your Scanu Productions account.
//If the user has previously toggled the local highscore switch, set hsLocal to true
if (localStorage.getItem('useHSL') == "true") {
	hsLocal = true;
	document.getElementById('3DBox').checked = true;
}
document.getElementById("instructions").style.display = "none";
document.getElementById("sysRequirements").style.display = "none";
document.getElementById("aliveDisplayContainer").style.display = "none";
window.onload = function () {
	if (hsLocal) {
		// Check browser support for local storage
		if (typeof (Storage) !== "undefined") {
			// Retrieve the previous highscore
			highScore = localStorage.getItem("Highscore");
			document.getElementById("hsDispMain").innerHTML = "Using local storage, Highscore: " + highScore;
		} else {
			noSupport("local storage");
		}
	} else {
		//Check if the user is signed in
		if (localStorage.getItem("ScanProdUN") !== null) {
			callPHP("https://scanuproductions.com/gooseChase/GetHS.php", "email=" + localStorage.getItem("ScanProdUN") + "&pw=" + localStorage.getItem("ScanProdPW")).then(function (value) {
				highScore = value;
				document.getElementById("hsDispMain").innerHTML = "Signed in as: " + localStorage.getItem("ScanProdNi") + ", Highscore: " + value;
			});
		} else {
			document.getElementById("hsDispMain").innerHTML = "Not signed in, <a href='/accounts'>Sign In Now</a>";
		}

	}
}
//move to start position and set number of lives to 3 and the score to 0000
document.getElementById("gamepiece").style.bottom = verticalPos;
document.getElementById("gamepiece").style.left = horizontalPos;
document.getElementById("aliveDisplay").innerHTML = alive;
document.getElementById("scoreDisplay").innerHTML = score;
//According to W3Schools, acessing the HTML DOM is one of the slowest things in JavaScript so accesing it only once when the page loads is faster.
let obs = document.getElementsByClassName('obstacle');
let pwu = document.getElementById('speed');
let pwu2 = document.getElementById('sheild');
let pwu3 = document.getElementById('small');
let pwu4 = document.getElementById('add');
let livesDisplay = document.getElementById('aliveDisplay');
let hitMenuLivesDisplay = document.getElementById('hitAliveDisplay');
let gp = document.getElementById('gamepiece'); //gets the gamepiece item
function isTouching(r1, r2) { //returns true if the two parameter elements are touching each other
	return !(r2.offsetLeft > r1.offsetLeft + r1.offsetWidth ||
		r2.offsetLeft + r2.offsetWidth < r1.offsetLeft ||
		r2.offsetTop > r1.offsetTop + r1.offsetHeight ||
		r2.offsetTop + r2.offsetHeight < r1.offsetTop);
}

let lastUpdate = performance.now();

function update(timeCalled) { //runs every four milliseconds
   let delta = timeCalled - lastUpdate;
   lastUpdate = timeCalled;

	if (active) { //if the game is started
		if (gp.offsetTop + gp.offsetHeight > window.innerHeight) {
			backSpeed = 0;
		}
		if (gp.offsetTop < 0) {
			forwardSpeed = 0;
		}
		if (gp.offsetLeft < 0) {
			leftSpeed = 0;
		}
		if (gp.offsetLeft + gp.offsetWidth > window.innerWidth) { //these ifs check if the gamepiece is touching the sides and stops it
			rightSpeed = 0;
		}
		y += (forwardSpeed - backSpeed) * delta;
		x += (rightSpeed - leftSpeed) * delta; //moves the block's position (x and y) by the movement speed in each direction


		gp.style.bottom = y + 'px';
		gp.style.left = x + 'px'; //actually sets the position from the lets
		moveBlock(delta); //moves the blocks
		blockSpeed += .001; //Slowly increases the speed of the blocks as the user plays more
		speed += .001;
		battery -= .01;
		document.getElementById("batteryStatus").style.height = battery + "px";
		if (battery < 0) {
			Hit(1);
		}
		if (hitActive == true) { //If the player does not have invulnerability.
			for (i = 0; i < obs.length; i++) { //iterates through all obstacles
				if (isTouching(document.getElementsByClassName('obstacle')[i], document.getElementById('gamepiece'))) { //if the obstacle touches the gamepiece
					if (sheild) {
						//Sheild is active destroy the goose
						document.getElementsByClassName('obstacle')[i].style.bottom = "-100";
					} else {
						alive--; //lose one life
						document.getElementById('aliveDisplay').innerHTML = alive;
						document.getElementById('hitAliveDisplay').innerHTML = alive; //display lives
						y += 60; //move down 60px
						Hit(0); //run the hit function (why is it capitalized its not an object or anything?)
					}
				}
			}

			if (isTouching(document.getElementById('speed'), document.getElementById('gamepiece'))) {
				startSpeed();
				setTimeout(endSpeed, 10000)
			}

			if (isTouching(document.getElementById('sheild'), document.getElementById('gamepiece'))) {
				startSheild();
				setTimeout(endSheild, 10000)
			}

			if (isTouching(document.getElementById('small'), document.getElementById('gamepiece'))) {
				startShrink();
				setTimeout(endShrink, 10000)
			}

			if (isTouching(document.getElementById('add'), document.getElementById('gamepiece'))) {
				//Award the player 1 life
				alive++;
				document.getElementById("aliveDisplay").innerHTML = alive;
				//Give the player 3 seconds of invunerability
				hitActive = false;
				setTimeout(resumeHit, 3000);
				document.getElementById("gamepiece").style.opacity = "0.5";
			}

			if (isTouching(document.getElementById('batteryUp'), document.getElementById('gamepiece'))) {
				battery += 20;
				if (battery > 70) {
					battery = 70;
				}
			}

		}

	}
   window.requestAnimationFrame(update);
}



document.addEventListener("keydown", function (event) { // runs when any key is down (not released) when the key is pressed, set the speed to 1 px/ms
	if (event.key == 's') { // if 's' is pressed, doesnt work on some browsers (!), maybe switch to event.which in future update?
		backSpeed = speed;
	}
	if (event.key == 'w') { // same as 's'	
		forwardSpeed = speed;
	}
	if (event.key == 'a') { // same as 's'
		leftSpeed = speed;
	}
	if (event.key == 'd') { // same as 's'	
		rightSpeed = speed;
	}
});

document.addEventListener("keyup", function (event) { // stop when the key is released
	if (event.key == 's') { //same as keydown function, but stops the movement when the key is released
		backSpeed = 0;
		if (mode == 2) {
			backSpeed = 1;
		}
	}
	if (event.key == 'w') {
		forwardSpeed = 0;
		if (mode == 3) {
			forwardSpeed = 1;
		}
	}
	if (event.key == 'a') {
		leftSpeed = 0;
	}
	if (event.key == 'd') {
		rightSpeed = 0;
	}
});

let mode = 1;

function startGame() {
	document.getElementById("startmenu").style.display = "none"; //Hide the main menu
	battery = 70;
	hitActive = false; //Give the player 3 seconds on invunerability
	document.getElementById("gamepiece").style.opacity = "0.5";
	score = 0000; //Reset Score
	document.getElementById("scoreDisplay").innerHTML = score; //Update displays
	document.getElementById("highScoreDisplay").innerHTML = highScore;
	horizontalPos = 0; //Reset position letiables and apply them
	verticalPos = 0;
	document.getElementById("gamepiece").style.bottom = verticalPos * 20;
	document.getElementById("gamepiece").style.left = horizontalPos * 20;
	active = true; //start the game
	document.getElementById("aliveDisplayContainer").style.display = "block"; //show the scoreF
	sheild = false;

	//Determine difficulty based on slider input
	let userInput = document.getElementById('difficultyInput').value;
	if (userInput == 0) {
		alive = 1;
		blockSpeed = 5;
		diff = "hard";
	} else if (userInput == 1) {
		alive = 3;
		blockSpeed = 4;
		diff = "medium (default)";
	} else if (userInput == 2) {
		alive = 5;
		blockSpeed = 3;
		diff = "easy";
	}

	//update remaining displays
	document.getElementById("aliveDisplay").innerHTML = alive;
	document.getElementById("hitAliveDisplay").innerHTML = alive;
	document.getElementById("diffDisplay").innerHTML = diff;

	requestAnimationFrame(update);
}

function endGame() {
	//Show menu and prepeare dialog
	document.getElementById("startmenu").style.display = "block";
	document.getElementById("startButton").innerHTML = "TRY AGAIN";
	document.getElementById("youDiedMessage").innerHTML = "You died, your score was " + Math.floor(score) + ".";
	active = false; ///stop the game
	//Hide the scores
	document.getElementById("hitMenu").style.display = "none";
	document.getElementById("aliveDisplayContainer").style.display = "none";
	//check if score beat the personal high and submit it if it does
	if (hsLocal) {
		localStorage.setItem('Highscore', highScore);
	} else {
		//Send the score to the server, the server will decide whether it is a high score
		callPHP('gooseChase/SaveHS.php', "email=" + localStorage.getItem("ScanProdUN") + "&pw=" + localStorage.getItem("ScanProdPW") + "&hs=" + Math.floor(score))

	}
}

//set the starting position of the blocks
let screenW = document.documentElement.clientWidth;
let screenH = document.documentElement.clientHeight;
let blockPos = []; //Make an empty array
for (i = 0; i < 10; i++) {
	blockPos[i] = Math.floor(Math.random() * screenW) + 1; //Fill the array with 10 random numbers from 0 to screenW
	document.getElementsByClassName('obstacle')[i].style.bottom = Math.floor(Math.random() * screenH) + 1;
}
let powPos = [{
	pos: 60 * 20,
	mult: 2,
	name: "speed"
}, {
	pos: 65 * 20,
	mult: 4,
	name: "sheild"
}, {
	pos: 70 * 20,
	mult: 3,
	name: "small"
}, {
	pos: 80 * 20,
	mult: 100,
	name: "add"
}, {
	pos: 90 * 20,
	mult: 4,
	name: "batteryUp"
}]

function moveBlock(delta) {
	//Lower the block position letiables
	for (i = 0; i < blockPos.length; i++) {
		blockPos[i] += (blockSpeed + (i / 50)) * delta;
		document.getElementsByClassName('obstacle')[i].style.transform = "translate(-" + blockPos[i] + "px, 0)";
		if (blockPos[i] > document.documentElement.clientWidth) {
			resetBlock(i);
		}
	}

	for (i = 0; i < powPos.length; i++) {
		powPos[i]['pos'] -= blockSpeed;
		document.getElementById(powPos[i]['name']).style.left = powPos[i]['pos'];
		if (powPos[i]['pos'] < 0) {
			resetPow(i);
		}

	}

	if (alive < 1) {
		endGame();
		//console.log("You are Dead")
	}

	if (score > highScore) {
		highScore = Math.floor(score);
		document.getElementById("highScoreDisplay").innerHTML = highScore;
		localStorage.setItem("Highscore", highScore);
	}
}

function resetBlock(blockN) {
	//Get the dimensions of the screen
	let screenWidth = document.documentElement.clientWidth;
	let screenHeight = document.documentElement.clientHeight - 20;
	//Set the blocks position to the right side of the screen and randomize the vertical position
	let BlockPos = screenWidth;
	BlockVPos = Math.floor(Math.random() * screenHeight) - screenHeight * (3.5 / 100);
	//Apply the new position to the block
	document.getElementsByClassName('obstacle')[i].style.transform = "translate(0,0)";
	document.getElementsByClassName('obstacle')[i].style.bottom = BlockVPos;
	//Add one to the score
	score += Number(speed);
	document.getElementById("scoreDisplay").innerHTML = Math.floor(score);
	blockPos[blockN] = 0;
}

function resetPow(powN) {
	//Get the dimensions of the screen
	let screenWidth = document.documentElement.clientWidth;
	let screenHeight = document.documentElement.clientHeight - 20;
	//Set the blocks position to the right side of the screen and randomize the vertical position
	let PowPos = screenWidth * powPos[powN]['mult'];
	PowVPos = Math.floor(Math.random() * screenHeight) - screenHeight * (3.5 / 100);
	//Apply the new position to the block
	document.getElementById(powPos[powN]['name']).style.left = PowPos;
	document.getElementById(powPos[powN]['name']).style.bottom = PowVPos;
	//Add one to the score
	powPos[powN]['pos'] = PowPos;
}

//Bring up hit menu
function Hit(why) {
	pauseGame();
	document.getElementById("hitMenu").style.display = "block";
	hitActive = false;
	if (why == 0) {
		document.getElementById("whyDisplay").innerHTML = "You've Been Hit!";
	} else if (why == 1) {
		document.getElementById("whyDisplay").innerHTML = "Out Of Battery!";
		battery = 40;
	}
}

//Pause the game
function pauseGame() {
	active = false;
}

//Resume the game
function resumeGame() {
	active = true;
	//Check that all menus are closed
	document.getElementById("hitMenu").style.display = "none";
	document.getElementById("gamepiece").style.opacity = "0.5";
}

function resumeHit() {
	//console.log("test");
	hitActive = true;
	document.getElementById("gamepiece").style.opacity = "1";
}

//show a section on the menu
function showSection(sectionID) {
	document.getElementById('mainSection').style.display = "none";
	document.getElementById(sectionID).style.display = "block";
}

//hide a section on the menu
function hideSection(sectionID) {
	document.getElementById('mainSection').style.display = "block";
	document.getElementById(sectionID).style.display = "none";
}

function startSpeed() {
	speed += .5;
	document.getElementById("gamepiece").style.borderBottom = "purple solid 5px";
}

function endSpeed() {
	speed -= .5;
	document.getElementById("gamepiece").style.borderBottom = "none";
}

function startSheild() {
	sheild = true;
	document.getElementById("gamepiece").style.opacity = "0.5";
}

function endSheild() {
	sheild = false;
	document.getElementById("gamepiece").style.opacity = "1";
}

function startShrink() {
	document.getElementById("gamepiece").style.width = "25";
	document.getElementById("gamepiece").style.height = "25";
	document.getElementById("gamepiece").style.borderBottom = "solid lightblue 5px";
}

function endShrink() {
	document.getElementById("gamepiece").style.width = "3vw";
	document.getElementById("gamepiece").style.height = "3vw";
	document.getElementById("gamepiece").style.borderBottom = "none";
}


/*
         (                             (                                                        
 )\ )                          )\ )            (                  )                     
(()/(         )           (   (()/( (          )\ )   (        ( /( (                   
 /(_)) (   ( /(   (      ))\   /(_)))(    (   (()/(  ))\   (   )\()))\   (    (     (   
(_))   )\  )(_))  )\ )  /((_) (_)) (()\   )\   ((_))/((_)  )\ (_))/((_)  )\   )\ )  )\  
/ __| ((_)((_)_  _(_/( (_))(  | _ \ ((_) ((_)  _| |(_))(  ((_)| |_  (_) ((_) _(_/( ((_) 
\__ \/ _| / _` || ' \))| || | |  _/| '_|/ _ \/ _` || || |/ _| |  _| | |/ _ \| ' \))(_-< 
|___/\__| \__,_||_||_|  \_,_| |_|  |_|  \___/\__,_| \_,_|\__|  \__| |_|\___/|_||_| /__/ 
                                                                                       */

// Set dark theme
function darkTheme() {
	document.getElementById("game").style.background = "url('images/skydark.jpg')";
	document.getElementById("aliveDisplayContainer").style.color = "white";
	document.getElementById("openButton").style.color = "white";
	let c = document.body.children;
	for (let i = 0; i < c.length; i++) {
		c[i].style.cursor = "url(https://scanuproductions.com/images/white-pointer.png) 5 5, crosshair";
	}
}
//Set light theme
function lightTheme() {
	document.getElementById("game").style.background = "url('images/sky.jpg')";
	document.getElementById("aliveDisplayContainer").style.color = "black";
	document.getElementById("openButton").style.color = "black";
	let c = document.body.children;
	for (let i = 0; i < c.length; i++) {
		c[i].style.cursor = "url(https://scanuproductions.com/images/pointer.png) 5 5, crosshair";
	}
}

function toggleThemes() {
	if (document.getElementById("DTBox").checked) {
		darkTheme();
	} else {
		lightTheme();
	}
}

function checkRatio() {
	let screenW = document.documentElement.clientWidth;
	let screenH = document.documentElement.clientHeight;
	if (screenH > screenW) {
		document.getElementById("gamepiece").style.width = "2.5vh";
		document.getElementById("gamepiece").style.height = "2.5vh";
		let obstacle = document.getElementsByClassName('obstacle');
		for (i = 0; i < obstacle.length; i++) {
			obstacle[i].style.width = "5vh";
			obstacle[i].style.height = "5vh";
		}
		let powerUp = document.getElementsByClassName('puGeneric');
		for (i = 0; i < powerUp.length; i++) {
			powerUp[i].style.width = "4vh";
			powerUp[i].style.height = "4vh";
		}
	} else {
		document.getElementById("gamepiece").style.width = "2.5vw";
		document.getElementById("gamepiece").style.height = "2.5vw";
		let obstacle = document.getElementsByClassName('obstacle');
		for (i = 0; i < obstacle.length; i++) {
			obstacle[i].style.width = "5vw";
			obstacle[i].style.height = "5vw";
		}
		let powerUp = document.getElementsByClassName('puGeneric');
		for (i = 0; i < powerUp.length; i++) {
			powerUp[i].style.width = "4vw";
			powerUp[i].style.height = "4vw";
		}
	}
}

function noSupport(reason) {
	document.getElementById("supportMenu").style.display = "block";
	document.getElementById("errorDisplay").innerHTML = "Sorry, you cannot play Wild Goose Chase because your browser does not support " + reason + ". Make sure you are using an up to date version of Chrome or Firefox.";
	document.getElementById("startmenu").style.display = "none";
}

async function callPHP(url, params) {
	let httpc = new XMLHttpRequest(); // simplified for clarity
	httpc.open("POST", url, true); // sending as POST
	httpc.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	let promise = new Promise((resolve, reject) => {
		httpc.onreadystatechange = function () { //Call a function when the state changes.
			if (httpc.readyState == 4 && httpc.status == 200 && httpc.responseText != "") { // complete and no errors
				resolve(httpc.responseText); // some processing here, or whatever you want to do with the response
			}
		}
	});
	httpc.send(params);
	return promise;
}

function toggleHSL() {
	hsLocal = !hsLocal;
	localStorage.setItem("useHSL", hsLocal);
	if (hsLocal) {
		// Retrieve the previous highscore
		highScore = localStorage.getItem("Highscore");
		document.getElementById("hsDispMain").innerHTML = "Using local storage, Highscore: " + highScore;
	} else {
		//Check if the user is signed in
		if (localStorage.getItem("ScanProdUN") !== null) {
			callPHP("https://scanuproductions.com/gooseChase/GetHS.php", "email=" + localStorage.getItem("ScanProdUN") + "&pw=" + localStorage.getItem("ScanProdPW")).then(function (value) {
				highScore = value;
				document.getElementById("hsDispMain").innerHTML = "Signed in as: " + localStorage.getItem("ScanProdNi") + ", Highscore: " + value;
			});
		} else {
			document.getElementById("hsDispMain").innerHTML = "Not signed in, <a href='/accounts'>Sign In Now</a>";
		}
	}
}

function showHitboxes() {
	for (i = 0; i < 10; i++) {
		document.getElementsByClassName('obstacle')[i].style.outline = "solid thin blue";
	}
	document.getElementById("gamepiece").style.outline = "solid thin black";
}
