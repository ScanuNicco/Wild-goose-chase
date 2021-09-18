var horizontalPos = 0; //horizontal position of player
var verticalPos = 0; //vertical position of player
var alive = 0; //the number of lives the player has left
var score = 0; //the number of points the player has
var highScore = 0; //the highest score the player has achieved
var active = true; //whether the game is running or not
var forwardSpeed = 0; //speed in px/ms (pixels per millisecond) to move forward (up)
var backSpeed = 0; //speed in px/ms to move back (down)
var leftSpeed = 0; //speed in px/ms to move left
var rightSpeed = 0; //speed in px/ms to move right
var active = false; //if the game is active, off until game starts
var hit = false; //if the block has been hit
var blockSpeed = 1; //speed the blocks move, in px/ms
var speed = 1.25; //speed of block in px/ms
var y = 0; //position of gamepiece vertically
var x = 0; //position of gp horizontally
var hitActive = true; //if the obstacles hit the gamepiece
var battery = 70; //Amount of battery that the drone has (0 - 70)
var hsLocal = false; //Store highscore locally instead of on your Scanu Productions account.
var powerups = [{"name":"Speed", "active":false, "time":0, "end":endSpeed}, {"name":"Shrink", "active":false, "time":0, "end":endShrink}, {"name":"Bayonet", "active":false, "time":0, "end":endSheild}];
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
			document.getElementById("hsDispMain").innerHTML = "Not signed in, <a href='#' onclick=\"location.href = 'https://scanuproductions.com/accounts/login.html?afterlogin=' + location.href\">Sign In Now</a>";
		}

	}
}
//move to start position and set number of lives to 3 and the score to 0000
document.getElementById("gamepiece").style.bottom = verticalPos;
document.getElementById("gamepiece").style.left = horizontalPos;
document.getElementById("aliveDisplay").innerHTML = alive;
document.getElementById("scoreDisplay").innerHTML = score;
//According to W3Schools, acessing the HTML DOM is one of the slowest things in JavaScript so accesing it only once when the page loads is faster.
var obs = document.getElementsByClassName('obstacle');
var pwu = document.getElementById('speed');
var pwu2 = document.getElementById('sheild');
var pwu3 = document.getElementById('small');
var pwu4 = document.getElementById('add');
var livesDisplay = document.getElementById('aliveDisplay');
var hitMenuLivesDisplay = document.getElementById('hitAliveDisplay');
var gp = document.getElementById('gamepiece'); //gets the gamepiece item
function isTouching(r1, r2) { //returns true if the two parameter elements are touching each other
	var r1box = r1.getBoundingClientRect();
	var r2box = r2.getBoundingClientRect();
	return !(r2box.left > r1box.left + r1.offsetWidth ||
		r2box.left + r2.offsetWidth < r1box.left ||
		r2box.top > r1box.top + r1.offsetHeight ||
		r2box.top + r2.offsetHeight < r1box.top);
}

function update() { //runs every ten milliseconds
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
		y += forwardSpeed - backSpeed;
		x += rightSpeed - leftSpeed; //moves the block's position (x and y) by the movement speed in each direction


		gp.style.bottom = y + 'px';
		gp.style.left = x + 'px'; //actually sets the position from the vars
		moveBlock(); //moves the blocks
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
			}

			if (isTouching(document.getElementById('sheild'), document.getElementById('gamepiece'))) {
				startSheild();
			}

			if (isTouching(document.getElementById('small'), document.getElementById('gamepiece'))) {
				startShrink();
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
		document.getElementById("powerUpsDisplay").innerHTML = "";
		for(i = 0; i < powerups.length; i++){
			//Loop through the powerups array
			if(powerups[i]["active"]){//If the poweup is active
				powerups[i]["time"] -= 10;//Lower the time by 10 milliseconds
				document.getElementById("powerUpsDisplay").innerHTML += "<p>" + powerups[i]["name"] + ": " + Math.floor(powerups[i]["time"] / 1000) + "s</p>";
				if(powerups[i]["time"] < 0){
					console.log("Ending " + powerups[i]["name"]);
					powerups[i].end();//If there is no time left, call the end function
					powerups[i]["active"] = false;
				}
			}
		}

	}
}
setInterval(update, 10); //run the update function from earlier every ten milliseconds (100fps)

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

var mode = 1;

function startGame() {
	document.getElementById("startmenu").style.display = "none"; //Hide the main menu
	battery = 70;
	speed = 1.25;
	powerups = [{"name":"Speed", "active":false, "time":0, "end":endSpeed}, {"name":"Shrink", "active":false, "time":0, "end":endShrink}, {"name":"Bayonet", "active":false, "time":0, "end":endSheild}];
	hitActive = false; //Give the player 3 seconds on invunerability
	document.getElementById("gamepiece").style.opacity = "0.5";
	score = 0000; //Reset Score
	document.getElementById("scoreDisplay").innerHTML = score; //Update displays
	document.getElementById("highScoreDisplay").innerHTML = highScore;
	horizontalPos = 0; //Reset position variables and apply them
	verticalPos = 0;
	document.getElementById("gamepiece").style.bottom = verticalPos * 20;
	document.getElementById("gamepiece").style.left = horizontalPos * 20;
	active = true; //start the game
	document.getElementById("aliveDisplayContainer").style.display = "block"; //show the scoreF
	sheild = false;

	//Determine difficulty based on slider input
	var userInput = document.getElementById('difficultyInput').value;
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
	for(i = 0; i < powerups.length; i++){
			//Loop through the powerups array
			if(powerups[i]["active"]){//If the poweup is active
				powerups[i]["time"] = 0;//Lower the time by 10 milliseconds
				powerups[i].end();//If there is no time left, call the end function
				powerups[i]["active"] = false;
			}
		}
}

//set the starting position of the blocks
var screenW = document.documentElement.clientWidth;
var screenH = document.documentElement.clientHeight;
var blockPos = []; //Make an empty array
for (i = 0; i < 10; i++) {
	blockPos[i] = Math.floor(Math.random() * screenW) + 1; //Fill the array with 10 random numbers from 0 to screenW
	document.getElementsByClassName('obstacle')[i].style.bottom = Math.floor(Math.random() * screenH) + 1;
}
var powPos = [{
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

function moveBlock() {
	//Lower the block position variables
	for (i = 0; i < blockPos.length; i++) {
		blockPos[i] -= blockSpeed + (i / 5);
		document.getElementsByClassName('obstacle')[i].style.left = blockPos[i];
		if (blockPos[i] < 0) {
			resetBlock(i);
		}
	}

	for (i = 0; i < powPos.length; i++) {
		powPos[i]['pos'] -= blockSpeed;
		document.getElementsByClassName('puContainer')[i].style.left = powPos[i]['pos'];
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
	var screenWidth = document.documentElement.clientWidth;
	var screenHeight = window.innerHeight - (window.innerHeight / 20); //Subtract the height of one goose (5vh) so it isn't off-screen
	//Set the blocks position to the right side of the screen and randomize the vertical position
	var blockXPos = screenWidth;
	blockYPos = Math.floor(Math.random() * screenHeight);
	//Apply the new position to the block
	document.getElementsByClassName('obstacle')[i].style.left = blockXPos;
	document.getElementsByClassName('obstacle')[i].style.bottom = blockYPos;
	console.log(blockYPos);
	//Add one to the score
	score += Number(speed);
	document.getElementById("scoreDisplay").innerHTML = Math.floor(score);
	blockPos[blockN] = blockXPos;
}

function resetPow(powN) {
	//Get the dimensions of the screen
	var screenWidth = document.documentElement.clientWidth;
	var screenHeight = window.innerHeight - (window.innerHeight / 25); //Subtract the height of one power-up(4vh) so it isn't off-screen
	//Set the blocks position to the right side of the screen and randomize the vertical position
	var PowPos = screenWidth * powPos[powN]['mult'];
	PowVPos = Math.floor(Math.random() * screenHeight);
	//Apply the new position to the block
	document.getElementsByClassName('puContainer')[powN].style.left = PowPos;
	document.getElementsByClassName('puContainer')[powN].style.bottom = PowVPos;
	//Add one to the score
	powPos[powN]['pos'] = PowPos;
}

//Bring up hit menu
function Hit(why) {
	pauseGame();
	document.getElementById("hitMenu").style.display = "block";
	hitActive = false;
	if (why == 0) {
		document.getElementById("whyDisplay").innerHTML = "You hit a Goose!";
	} else if (why == 1) {
		document.getElementById("whyDisplay").innerHTML = "You Ran Out of Battery!";
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
	powerups[0]["active"] = true;
	powerups[0]["time"] = 10000;
}

function endSpeed() {
	speed -= .5;
	document.getElementById("gamepiece").style.borderBottom = "none";
}

function startSheild() {
	sheild = true;
	document.getElementById("gamepiece").style.opacity = "0.5";
	powerups[2]["active"] = true;
	powerups[2]["time"] = 10000;
}

function endSheild() {
	sheild = false;
	document.getElementById("gamepiece").style.opacity = "1";
}

function startShrink() {
	document.getElementById("gamepiece").style.width = "25";
	document.getElementById("gamepiece").style.height = "25";
	document.getElementById("gamepiece").style.borderBottom = "solid lightblue 5px";
	powerups[1]["active"] = true;
	powerups[1]["time"] = 10000;
}

function endShrink() {
	document.getElementById("gamepiece").style.width = "2.5vw";
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
	var c = document.body.children;
	for (var i = 0; i < c.length; i++) {
		c[i].style.cursor = "url(https://scanuproductions.com/images/white-pointer.png) 5 5, crosshair";
	}
}
//Set light theme
function lightTheme() {
	document.getElementById("game").style.background = "url('images/sky.jpg')";
	document.getElementById("aliveDisplayContainer").style.color = "black";
	document.getElementById("openButton").style.color = "black";
	var c = document.body.children;
	for (var i = 0; i < c.length; i++) {
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
	var screenW = document.documentElement.clientWidth;
	var screenH = document.documentElement.clientHeight;
	if (screenH > screenW) {
		document.getElementById("gamepiece").style.width = "2.5vh";
		document.getElementById("gamepiece").style.height = "1.5vh";
		var obstacle = document.getElementsByClassName('obstacle');
		for (i = 0; i < obstacle.length; i++) {
			obstacle[i].style.width = "5vh";
			obstacle[i].style.height = "5vh";
		}
		var powerUp = document.getElementsByClassName('puGeneric');
		for (i = 0; i < powerUp.length; i++) {
			powerUp[i].style.width = "4vh";
			powerUp[i].style.height = "4vh";
		}
	} else {
		document.getElementById("gamepiece").style.width = "2.5vw";
		document.getElementById("gamepiece").style.height = "1.5vw";
		var obstacle = document.getElementsByClassName('obstacle');
		for (i = 0; i < obstacle.length; i++) {
			obstacle[i].style.width = "5vw";
			obstacle[i].style.height = "5vw";
		}
		var powerUp = document.getElementsByClassName('puGeneric');
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
	var httpc = new XMLHttpRequest(); // simplified for clarity
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

setTimeout(function () {
	if (highScore > 0) {
		//User has played game before, don't play intro
		document.getElementById('intro').style.display = 'none';
	} else { //user has not played game before, play intro
		document.getElementById('intro').style.display = 'block';
		document.getElementById('introVideo').play();
	}
}, 500);

function showHitboxes() {
	for (i = 0; i < 10; i++) {
		document.getElementsByClassName('obstacle')[i].style.border = "solid thin blue";
	}
	document.getElementById("gamepiece").style.border = "solid thin black";
}
