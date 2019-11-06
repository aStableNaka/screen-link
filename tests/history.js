const robot = require("robotjs");
const fs = require("fs");
const history = JSON.parse(fs.readFileSync( "./history.json" ).toString());

console.log(history.log[0].pos);

var cdate = history.start;

var count = 0;
var pos = null;

robot.setMouseDelay(0);

function next(){
	if(count-1 < history.log.length ){
		var hist = history.log[count],
				timeout = history.log[count+1].date - hist.date ;
		robot.moveMouse( hist.pos.x, hist.pos.y );
		count++;
		console.log( hist, timeout );
		setTimeout( next, timeout );
	}
}

next();
