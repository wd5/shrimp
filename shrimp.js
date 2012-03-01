//Major globals
var levels = {1: {fill: 0.4, matches: 0.07, caption: "Once there was a boy."},
		2: {fill: 0.4, matches: 0.07, caption: "His parents were scientists."},
		3: {fill: 0.5, matches: 0.06, caption: "They worked on an important project."},
		4: {fill: 0.5, matches: 0.06, caption: "A meteor fell from space."},
		5: {fill: 0.5, matches: 0.05, caption: "The meteor contained a powerful energy."},
		6: {fill: 0.6, matches: 0.05, caption: "It was taken to a lab."},
		7: {fill: 0.6, matches: 0.04, caption: "Research progressed."},
		8: {fill: 0.7, matches: 0.04, caption: "The boy went to visit his parents."},
		9: {fill: 0.7, matches: 0.04, caption: "They were called away."},
		10: {fill: 0.8, matches: 0.03, caption: "He was alone."},
		11: {fill: 0.9, matches: 0.02, caption: "He wandered around."},
		12: {fill: 0.2, matches: 0.01, caption: "He thought it would be nice to have a friend."},
		13: {fill: 0, matches: 0, caption: "The End. Thanks for playing!"}}


//Helper functions
function c(x) { return (2*x);}

function mazegen(y,x){
	//Generates a maze. 
	//Note that mazes must have odd dimensions, since walls get their own coordinates. 
	//Thus, the actual dimensions are (x*2)-3 by (y*2)-3. This may need adjustment.

	var maze = new Array(c(x-1)+1);
	for(i=0;i<maze.length;i++){maze[i]= new Array(c(y-1)+1);}

	var start = Math.floor(Math.random() * (x+y));
	var startcell = {x:0, y:0};
	if (start > x) {startcell.y = start - x;}
	else {startcell.x = start;}

	//TODO fix bug here...
	maze[c(startcell.x)][c(startcell.y)] = 1;
	var cc = startcell;
	var opcells = new Array();

	while(true){
		//Neighbors
		var n = new Array(0);

		//Check for unused neighbors
		if(cc.x > 0 && maze[c(cc.x-1)][c(cc.y)] != 1){n.push({x:cc.x-1,y:cc.y})}
		if(cc.x < x-1 && maze[c(cc.x+1)][c(cc.y)] != 1){n.push({x:cc.x+1,y:cc.y})}
		if(cc.y > 0 && maze[c(cc.x)][c(cc.y-1)] != 1){n.push({x:cc.x,y:cc.y-1})}
		if(cc.y < y-1 && maze[c(cc.x)][c(cc.y+1)] != 1){n.push({x:cc.x,y:cc.y+1})}

		if(n.length > 0){
			//Pick one
			var next = n[Math.floor(Math.random() * n.length)];

			//Fill it and erase the wall
			maze[c(next.x)][c(next.y)] = 1;
			maze[c(next.x) + (cc.x-next.x)][c(next.y) + (cc.y-next.y)] = 1;

			//And use it next
			cc = next;
			//Add selected to the pool
			opcells.push(next);
		}
		else {
			if(opcells.length == 0) break;
			cc = opcells.pop();
		}
	}

	//Output
	for(i=0;i<c(x)-1;i++){
		var line = "";
		for(j=0;j<c(y)-1;j++){
			if(maze[i][j] == 1) line+=" ";
			else {
				line+="#";
				maze[i][j] = 0;
			}
		}
		//console.log(line);
	}
	//console.log(maze);
	return maze;
}

function decay(map, fill){
	var i,j;
	for(i=0;i<map.length;i++){
		for(j=0;j<map[0].length;j++){
			if(Math.random() > fill) map[i][j] = 0;
		}
	}
	return map;
}


function maptrans(map){
	//Given a map with descriptive tile names, changes them to numeric values
	var i,j;
	for(i=0;i<map.length;i++){
		for(j=0;j<map[0].length;j++){
			if(map[i][j] === 1) {map[i][j] = 0; continue;}
			if(map[i][j] === 0) {map[i][j] = Math.floor(Math.random() * 4) + 1; continue;}
		}
	}
	return map;
}

function border(map){
	//Given a map, make a solid border around it
	//Assume 0 is open and 1 is solid
	var nx = map.length + 2;
	var ny = map[0].length + 2;
	var nmap = new Array(nx);
	var i,j;
	for(i=0;i<nx;i++){
		nmap[i] = new Array(ny);
		for(j=0;j<ny;j++){
			if(i === 0 || i === nx-1 || j === 0 || j === ny-1){nmap[i][j]=1;}
			else {nmap[i][j] = map[i-1][j-1];}
		}
	}
	return nmap;
}

window.onload = function () {
	enchant();
 
	var game = new Game(320, 240);
	game.fps = 30;
	game.scale = 2;
	//Resources
	game.preload("boy.png");
	game.preload("map.png");
	game.preload("darkness.png");
	game.preload("match.png");
	game.preload("goal.png");
	//Sounds
	game.preload("death.wav", "matchcount.wav", "matchlight.wav", "matchpickup.wav", "shrimp.wav", "warp.wav");
	//Keybindings
	game.keybind(90,"a");
	game.keybind(88,"b");
	var level = 1;
	var paused = false;

	game.onload = function () {
		var player = new Sprite(16,16);
		player.x = 0;
		player.y = 0;
		player.facing = 0;
		player.image = game.assets["boy.png"];

		var darkness = new Array(4);
		var i;
		for(i=0;i<darkness.length;i++){
			darkness[i] = new Sprite(1000,1000);
			darkness[i].image = game.assets["darkness.png"];
			darkness[i].rotate(90*i);
		}
		var margin = 16 * 5;
		var counter = 0;

		//TODO decide on numbers...
		player.matches = 3;

		player.addEventListener('enterframe', function(e){
			if(paused){console.log("paused");return;}
			if(game.frame % (30 * 5) === 0 && Math.random() < .33){
				game.assets["shrimp.wav"].play();

			}
			//Input checks
			var x = player.x;
			var y = player.y;
			var ok = function(x,y) { return !map.hitTest(x,y);};
			if(game.input.right && ok(x+14+2,y+2) && ok(x+14+2,y+14)){player.x += 2; player.facing = 1;}
			if(game.input.left && ok(x-2,y+2) && ok(x-2,y+14)){player.x -= 2; player.facing = 3;}
			if(game.input.up && ok(x+2,y-2) && ok(x+14,y-2)){player.y -= 2; player.facing = 2;}
			if(game.input.down && ok(x+2,y+14+2) && ok(x+14,y+14+2)){player.y += 2; player.facing = 0;}
			player.frame = (player.facing * 3) + (game.frame % 3);
			

			counter++;
			if(counter===10){counter=0; margin-=2;}
			if(margin===8){
				//TODO play a creepy noise
				game.assets["death.wav"].play();
				//Just restart the level
				startlevel(level);
			}

			for(i=0;i<darkness.length;i++){
				darkness[i].x = 100000;
				darkness[i].y = 100000;
				switch (i){
					case 0: 
					case 1: 
						darkness[i].x = player.x - (darkness[i].width / 2) - margin;
						darkness[i].y = player.y - (darkness[i].height / 2) + 8;
						break;
					case 2: 
					case 3:
						darkness[i].x = player.x - (darkness[i].width / 2) + margin + 16;
						darkness[i].y = player.y - (darkness[i].height / 2) + 8;
						break;
				}
			}
		});

		game.addEventListener(Event.A_BUTTON_DOWN, function(e){
			console.log("a button");
			//Light a match
			if(player.matches === 0){
				//No matches - nice knowing you!
				game.assets["death.wav"].play();
			} else {
				//Reset darkness
				game.assets["matchlight.wav"].play();
				margin = 16 * 5;
				player.matches--;
			}
		});

		function matchcount(c){ return (c === 0) ? null : function (){game.assets["matchcount.wav"].play(); setTimeout(matchcount(c-1), 200);};}

		game.addEventListener(Event.B_BUTTON_DOWN, function(e){
			console.log("b button");
			//Count your matches
			if(player.matches === 0){
				game.assets["death.wav"].play();
			}else{
				var i;
				setTimeout(matchcount(player.matches), 200);
			}
		});

		var startlevel = function(level){
			//TODO level 13 = game over you won
			var fill = levels[level].fill;
			var caption = levels[level].caption;
			//show caption
			//create stage
			map = new Map(16,16);
			map.image = game.assets["map.png"];
			var mx = 20;
			var my = 16;
			var scene = new Scene();
			scene.addChild(map);
			var maze = addgoal(border(decay(maptrans(mazegen(20,16)),0.7)),scene);
			map.collisionData = maze;
			map.loadData(maze);
			
			//place player -  random player start location
			//Always safe because of how the maze algo works
			player.matches = 3;
			player.x = (2 * 16 * Math.floor(Math.random() * mx)) + 16;
			player.y = (2 * 16 * Math.floor(Math.random() * my)) + 16;

			scene.addChild(player);
			addmatches(maze,levels[level].matches, scene);
			scene.backgroundColor = "#f0f";
			for(i=0;i<darkness.length;i++){scene.addChild(darkness[i]);}

			var leveltext = new Scene();
			var label = new Label(caption);
			leveltext.backgroundColor = "#000";
			label.color = "#fff";
			label.y = (game.height / 2);
			label.x = (game.width / 2) - (label.width / 2);
			leveltext.addChild(label);
			leveltext.countdown = 60;
			leveltext.addEventListener('enterframe',function(e){
				//This should only display for a few seconds
				if(this.countdown===0 && level != 13) {paused = false; game.popScene();return;}
				paused = true;
				this.countdown--;
			});

			scene.addEventListener("enterframe", function(e){
				this.x = (game.width / 2) - player.x;
				this.y = (game.height / 2) - player.y;
			});

			margin = 16 * 5;

			game.popScene();
			game.pushScene(scene);
			game.pushScene(leveltext);

		}

		var Match = enchant.Class.create(enchant.Sprite, {initialize: function(x,y){
			enchant.Sprite.call(this,16,16);
			this.image = game.assets["match.png"];
			this.x = x * 16;
			this.y = y * 16;
			this.addEventListener('enterframe', function(e){
				if(this.opacity != 0 && this.intersect(player)){
					//TODO play noise
					game.assets["matchpickup.wav"].play();

					player.matches++;
					this.opacity = 0;
					game.rootScene.removeChild(this);
					delete this;
				}
			});

		}});

		function addmatches(map, fill, scene){
			fill = fill * 0.2;
			var i,j;
			for(i=0;i<map.length;i++){
				for(j=0;j<map[0].length;j++){
					if(map[i][j] === 0 && Math.random() < fill){
						//put in a match if lucky
						var match = new Match(j,i);
						scene.addChild(match);
					}
				}
			}
			return;
		}

		var Goal = enchant.Class.create(enchant.Sprite, {initialize: function(x,y){
			enchant.Sprite.call(this,16,16);
			this.image = game.assets["goal.png"];
			this.x = x * 16;
			this.y = y * 16; 
			this.basicy = this.y;
			this.bounce = 0;
			this.bouncedir = 1;
			this.addEventListener('enterframe', function(e){
				this.bounce += this.bouncedir;
				if(this.bounce < 0){this.bouncedir = 1; this.bounce = 0;}
				if(this.bounce > 5){this.bouncedir = -1; this.bounce = 5;}

				this.y = this.basicy + this.bounce; 

				if(this.intersect(player)){
					game.assets["warp.wav"].play();
					console.log("found goal!");
					level++;
					startlevel(level);
					game.rootScene.removeChild(this);
					delete this;
				}
			});

		}});

		function addgoal(map, scene){
			//Place the level end
			//It needs to be far from the player
			var width = map.length;
			var height = map[0].length;
			var x = (player.x / 16 < map.width / 2) ? map.width - Math.floor(Math.random() * 10) + 4  : Math.floor(Math.random() * 10) + 4;
			var y = (player.y / 16 < map.height / 2) ? map.height - Math.floor(Math.random() * 10) + 4 : Math.floor(Math.random() * 10) + 4;
			var i,j;
			for(i=x-2;i<x+3;i++){
				for(j=y-2;j<y+3;j++){
					map[j][i] = 0;
				}
			}
			//Add the goal point
			console.log("goal: " + x + ":" + y);
			var goal = new Goal(x,y);
			scene.addChild(goal);
			return map;
		}
	/*
		var map = new Map(16,16);
		map.image = game.assets["map.png"];
		var maze = decay(maptrans(mazegen(20,16)),0.7);
		map.loadData(maze);
		map.collisionData = maze;

		var stage = new Group();
		stage.addChild(map);
		stage.addChild(player);
		for(i=0;i<darkness.length;i++){stage.addChild(darkness[i]);}
		*/

		//game.rootScene.addChild(stage);
		startlevel(1);
		//game.rootScene.backgroundColor = "#ff000f";
	};

	//TODO logic 
	game.start();
}

