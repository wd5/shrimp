function mazegen(x,y){
	//Generate a maze of the specified dimensions
	//actual size is given dimensions each doubled plus one (due to walls)
	
	var fullwidth = 
}

function maptrans(map){
	//Given a map with descriptive tile names, changes them to numeric values
	//TODO
}

window.onload = function () {
	enchant();
 
	var game = new Game(320, 240);
	game.fps = 30;
	game.zoom = 2
	//Resources
	game.preload("player.gif");
	game.preload("map.gif");

	game.onload = function () {
		var player = new Sprite(16,16);
		player.x = 0;
		player.y = 0;
		player.image = game.assets["player.gif"];

		player.addEventListener('enterframe', function(e){
			//Input checks
			var x = player.x;
			var y = player.y;
			var ok = function(x,y) { return !map.hitTest(x,y);};
			console.log(x + ":" + y);
			console.log("pie:" + map.hitTest(5,5));
			console.log("cake:" + map.hitTest(45,45));
			console.log("cake:" + map.hitTest(145,145));
			if(game.input.right && ok(x+16+2,y)){player.x += 2;}
			if(game.input.left && ok(x-2,y)){player.x -= 2;}
			if(game.input.up && ok(x,y-2)){player.y -= 2;}
			if(game.input.down && ok(x,y+16+2)){player.y += 2;}
		});

		var map = new Map(16,16);
		map.image = game.assets["map.gif"];
		map.loadData([ [0,1,1], [0,0,0], [0,1,1] ]);
		map.collisionData = [ [0,1,1], [0,0,0], [0,1,1] ];

		game.rootScene.addChild(map);
		game.rootScene.addChild(player);
		game.rootScene.backgroundColor = "#ff000f";
	};
	//TODO mapgen
	//TODO logic 
	game.start();
}

