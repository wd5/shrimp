//Major globals
var levels = {1: {fill: 0.6, caption: "Once there was a boy."}}


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
		console.log(line);
	}
	console.log(maze);
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
			if(map[i][j] === 0) {map[i][j] = 1; continue;}
		}
	}
	return map;
}

window.onload = function () {
	enchant();
 
	var game = new Game(640, 480);
	game.fps = 30;
	game.scale = 1;
	//Resources
	game.preload("player.gif");
	game.preload("map.png");
	game.preload("darkness.png");
	//Keybindings
	game.keybind(90,"a");
	var level = 1;
	var paused = false;

	

	game.onload = function () {
		var player = new Sprite(16,16);
		player.x = 0;
		player.y = 0;
		player.image = game.assets["player.gif"];
		player.rotate(90);

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
		player.matches = 5;

		player.addEventListener('enterframe', function(e){
			if(paused){return;}
			//Input checks
			var x = player.x;
			var y = player.y;
			var ok = function(x,y) { return !map.hitTest(x,y);};
			if(game.input.right && ok(x+14+2,y) && ok(x+14+2,y+14)){player.x += 2;}
			if(game.input.left && ok(x-2,y) && ok(x-2,y+14)){player.x -= 2;}
			if(game.input.up && ok(x,y-2) && ok(x+14,y-2)){player.y -= 2;}
			if(game.input.down && ok(x,y+14+2) && ok(x+14,y+14+2)){player.y += 2;}

			counter++;
			if(counter===10){counter=0; margin--;}
			if(margin===0){
				//TODO play a creepy noise
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
			//Light a match
			if(player.matches === 0){
				//No matches - nice knowing you!
				//TODO play sad noise
			} else {
				//Reset darkness
				//TODO play match noise
				margin = 16 * 5;
				player.matches--;
			}
		});

		game.addEventListener(Event.B_BUTTON_DOWN, function(e){
			//Count your matches
			if(player.matches === 0){
				//TODO play sad noise
			}else{
				var i;
				for(i=0;i<player.matches;i++){
					//TODO play click
				}
			}
		});

		var startlevel = function(level){
			var fill = levels[level].fill;
			var caption = levels[level].caption;
			//TODO show caption
			//TODO create stage
			var map = new Map(16,16);
			var maze = decay(maptrans(mazegen(20,16)),0.7);
			map.loadData(maze);
			map.collisionData = maze;
			var scene = new Scene();

			scene.addChild(map);
			scene.addChild(player);
			scene.backgroundColor = "#f0f";
			for(i=0;i<darkness.length;i++){scene.addChild(darkness[i]);}

			var leveltext = new Scene();
			var label = new Label(caption);
			leveltext.backgroundColor = "#000";
			label.color = "#fff";
			leveltext.addChild(label);
			leveltext.countdown = 60;
			leveltext.addEventListener('enterframe',function(e){
				//This should only display for a few seconds
				if(this.countdown===0) {paused = false; game.popScene();}
				paused = true;
				this.countdown--;
			});

			scene.addEventListener("enterframe", function(e){
				stage.x = (game.width / 2) - player.x;
				stage.y = (game.height / 2) - player.y;
			});

			game.popScene();
			game.pushScene(scene);
			game.pushScene(leveltext);

		}

		var map = new Map(16,16);
		map.image = game.assets["map.png"];
		var maze = decay(maptrans(mazegen(20,16)),0.7);
		map.loadData(maze);
		map.collisionData = maze;

		var stage = new Group();
		stage.addChild(map);
		stage.addChild(player);
		for(i=0;i<darkness.length;i++){stage.addChild(darkness[i]);}

		game.rootScene.addEventListener("enterframe", function(e){
			stage.x = (game.width / 2) - player.x;
			stage.y = (game.height / 2) - player.y;
		});

		//game.rootScene.addChild(stage);
		startlevel(1);
		//game.rootScene.backgroundColor = "#ff000f";
	};




	//TODO logic 
	game.start();
}

