var Node = require("./node.js"),
		screen = new Node(),
		address = process.argv[2] ? process.argv[2] : "0.0.0.0";

console.log("SCREEN", address);

screen.connect(address, 17822);

setTimeout( ()=>{
	if(!screen.authorized){
		console.log("Connection timeout...");
		screen.terminate();
	}
}, 5000 )
