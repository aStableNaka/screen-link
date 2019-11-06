const dgram = require("dgram");
const server = dgram.createSocket("udp4");

server.on("message", (msg, rinfo)=>{
	var reply = new Date().getTime().toString();
	console.log(msg.toString(), rinfo);
	if(msg.toString()=="close"){
		//server.close();
		return;
	}
	server.send(reply, 0, reply.length, rinfo.port, rinfo.address);
})

server.on("listening", ()=>{
	var address = server.address();
	console.log(address.address, address.port);
})

server.bind(12349);
