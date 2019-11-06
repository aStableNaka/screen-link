const iohook = require("iohook");
const controller = require("robotjs");
const size = controller.getScreenSize();

const fs = require("fs");

var locked = false;

var history = {
	start: new Date().getTime(),
	log:[]
};

var iPos = {
	x:size.width/2,
	y:size.height/2
}

var pos = {
	x: iPos.x,
	y: iPos.y
}



function log( ...data ){
	console.log(data);
}


function checkForEscapeKey( event ){
	log( event );
	if( event.keycode == 1 ){
		fs.writeFileSync("history.json", JSON.stringify(history));
		process.exit();
	}

}

controller.setMouseDelay( 0 );

// To block input while the mouse is being moved

lock = function(){locked = true;}
unlock = function(){locked = false;}

// Alters the internal position based on a change in mouse position from the origin
function alterPosition( newx, newy ){
	pos.x -= iPos.x - mouseEvent.x;
	pos.y -= iPos.y - mouseEvent.y;
}

// Creates a snapshot of the position, in string form to eliminate refrence from the pos variable
function snapshotPosition(){
	return JSON.stringify( pos );
}


// for testing the smoothness of input-output
appendHistoryLog( mouseEvent ){
	history.log.push({
		event: mouseEvent,
		pos: snapshotPosition(),
		date: new date().getTime()
	});
}

function handleMouseMove( mouseEvent ){
	if(!locked){
		// Change internal position using delta
		alterPosition( mouseEvent.x, mouseEvent.y );

		// For statistical and debugging purposes
		appendHistoryLog();
		log( mouseEvent );
		log(pos);

		// Block input while the mouse is being moved by controllerjs
		lock();
		controller.moveMouse( iPos.x , iPos.y );

		// Release the block a bit later
		setTimeout(unlock,1);
	}
}




iohook.on("mousemove", handleMouseMove);
iohook.on("keydown", checkForEscapeKey);

iohook.start();
