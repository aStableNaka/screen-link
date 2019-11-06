const dgram = require("dgram");
const PacketRegistry = require("./packets.js");
const os = require("os");
const netIfaces = os.networkInterfaces();

var addresses = [];

Object.keys(netIfaces).map( ( key )=>{
	var ifaces = netIfaces[ key ];
	ifaces.map( ( iface )=>{
		if( iface.family == "IPv4" ){addresses.push( JSON.stringify({address: iface.address, interface: key} ));}
	})
});

Number.prototype.inBounds = function( low, high ){
	return this >= low && this <= high;
}

// Returns the multiplicative inverse identity
Number.prototype.sign = function(){
	return this/Math.abs(this);
}

var vb = new (require("./verbose.js"))({
	recieve_auth_request:true,
	send_auth_request:true,
	recieve_auth_host:true,
	send_auth_host:true,
	recieve_tfcontrol:true,
	self_tfcontrol:true,
	recieve_mousemove:false,
	send_mousemove:false,
	recieve_mousedrag: false,
	send_mousedrag: false,

	recieve_mousedown: true,
	send_mousedown: false,
	recieve_mouseup: false,
	send_mouseup: false,
	recieve_keydown: false,
	send_keydown: false,
	recieve_keyup: false,
	send_keyup: false,

	recieve_route_control_host: false,
	send_route_control_host: false,

	send_disconnect: true,
	recieve_disconnect: true,

	recieve_heartbeat: false,
	send_heartbeat: false,
	heartbeat_counter: false,
	revieve_ready: true,
	send_ready: true
}, true);




class Node{

	// Packets for sending
	pkt_auth_host( self, auth, assignedEdge, id ){
		return self.pkt_$( "auth_host", {authorized: auth, assignedEdge: assignedEdge, id: id} );
	}

	pkt_disconnect( self, id ){
		return self.pkt_$( "disconnect", {id:id} );
	}

	pkt_auth_request( self, phash ){
		return self.pkt_$( "auth_request", {screenSize: self.controller.getScreenSize(), phash: phash} );
	}

	pkt_return_control( self, pos, deltas ){
		return self.pkt_$("return_control", { pos: pos, deltas: deltas});
	}

	pkt_transfer_control(self, pos, enable){
		return self.pkt_$("transfer_control", {pos: pos, enable: enable});
	}

	pkt_ready( self, id ){
		return self.pkt_$( "ready", {id:id} );
	}

	pkt_heartbeat( self ){
		return self.pkt_$( "heartbeat" );
	}

	pkt_mousemove(self, event, delta){
		return self.pkt_$( "mousemove", {event: event, delta: delta} );
	}

	pkt_mousedown( self, event ){
		return self.pkt_$("mousedown", event);
	}

	pkt_mouseup( self, event ){
		return self.pkt_$("mouseup", event);
	}

	pkt_mousedrag(self, event, delta){
		return self.pkt_$( "mousedrag", {event: event, delta: delta} );
	}

	pkt_verify_file_integrity(){

	}




	// Reception handlers
	// Authorization of connection to host
	msg_auth_host( data, rinfo, self ){
		if( data.authorized ){
			self.authorized = true;
			self.edges[ (data.assignedEdge + 2) % 4 ];
			self.host = rinfo;
			self.hbInterval = setInterval( ()=>{ self.heartbeat( self ); }, 1000 );
			self.id = data.id;
			self.send( self.pkt_ready( self, self.id ), rinfo );
			console.log( `authorized connection to ${rinfo}` );
		}
		else{
			console.log( `denied connection to ${rinfo}` );
			self.terminate( "Denied Connection" );
		}
	}

	// When the a different screen will be controlled
	msg_transfer_control( data, rinfo, self ){
		if( data.enable ){
			self.focus = true;
			return;
		}
		self.focus = false;
	}

	// Ensures a live connection to host
	msg_heartbeat( data, rinfo, self ){
		vb.log("heartbeat_counter", self.heartbeatCounter);
		self.heartbeatCounter = 0;
	}

	// [ctrl+f] msg_mousemove helpers
	msg_mousemove( data, rinfo, self ){
		self.alterMPosition( data.delta );
	}

	msg_mousedown( data, rinfo, self ){
		self.controller.mouseToggle( Node.CM_DOWN, Node.MBUTTON_HC_MAP[ data.button ] );
	}

	msg_mouseup( data, rinfo, self ){
		self.controller.mouseToggle( Node.CM_UP, Node.MBUTTON_HC_MAP[ data.button ] );
	}

	msg_mousedrag( data, rinfo, self ){
		self.alterMPosition( data.delta );
	}

	/**
	 * Src file verifications
	 * Problem: Make sure the client is using the same <node.js> as the <host>
	 * - On auth confirmation, host sends hash of the <node.js> file
	 * - client compares it's own <node.js> hash to the hash
	 * - If different, the host sends the appropirate <node.js> files and requests client reconnect
	 * data:
	 * 	FileHashCollection {
	 * 		files:[ "path/to/file.js", ... ]
	 * 		hashes:[
	 * 			{path:"./src/file.js",hashtype:"md5". hash:"..."}
	 *			...
	 * 		]
	 * }
	 */
	msg_verify_file_integrity( data, rinfo, self ){
		
	}


	static get CM_DOWN(){ return "down"; }
	static get CM_UP(){ return "up"; }

	// Hook to controller map (HC)
	static get MBUTTON_HC_MAP(){
		return ["","left","right","middle"];
	}

	static get EDGE_TOP(){return 0};
	static get EDGE_RIGHT(){return 1};
	static get EDGE_BOTTOM(){return 2};
	static get EDGE_LEFT(){return 3};
	/**
				0
			3	x 1
				2
	*/
	static get SOCK_EVENTS(){ return [
		"listening",
		"close",
		"message",
		"error"
	];}



	// Might be used later?
	static get PACKETS(){ return [
		"auth_request",
		"auth_host",
		"transfer_control",
		"ready",
		"mousemove",
		"mouseclick",
		"mousedrag",
		'mousewheel',
		"keydown"
	];}

	// shorthand wrapper
	str( data ){ return JSON.stringify(data); }

	pkt_$( protocol, data = {} ){
		var out = {
			protocol: protocol,
			salt: Math.random(),
			date: new Date().getTime()
		};
		Object.assign(out, data)
		return out;
	}






/*
	Dear code
	I've been overthinking again. I woke up this
	morning to find she tried texting me last night.
	But I was asleep before I saw the text
	and when I took a look at my feed I found she
	was struggling with some stomach issues.

	I talked to her this morning only a little
	bit because I assumed she wanted a break
	from our bad conversations.

	Once it was time for her to get off shift,
	I asked her if she was feeling better.

	Her reply threw me off, she said, simply,
	"Yes".

	I was hoping she'd follow up, but she
	didn't so I did by asking her if she
	wanted to go to the beach with us on
	thursday.

	She replied "Okay sure" which AGAIN threw
	me off.

	I'm overthinking this shit so much.

	I realized something today though, Maybe I'm
	giving her too much attention. I talked to
	Sandra just now and I realized how much more
	comfortable I was talking to sandra than I am
	to the girl I like. It was odd... It was as if
	i talked to little to sandra that I felt
	comfortable around her.

	Maybe I should not talk to the girl I like
	as much...
*/







	constructor(){
		// :D
		this.controller = require("robotjs");

		this.focus = false;
		this.edges = [ null, null, null, null ];
		this.host = null;

		this.size = this.controller.getScreenSize();
		this.socket =  dgram.createSocket("udp4");

		this.registerSocketHandlers();

		this.authorized = false;
		this.pktRegistry =new PacketRegistry();
		//this.registerPackets();

		// Setup controller
		this.controller.setMouseDelay( 0 );
		this.controllerMM = this.controller.moveMouse;

		// Mouse position
		this.mousePos = this.controller.getMousePos();

		// In case the mouse doesnt move in time
		this.movebuffer = [];

		this.heartbeatCounter = 0;

	}

	registerPackets(){
		var node = this;
		Node.PACKETS.map( ( pktID )=>{
			var pktCreate = this[`pkt_${pktID}`];
			if( pktCreate ){
				node.pktRegistry.register( pktID, pktCreate( node ) );
			}
		})
	}

	registerSocketHandlers(){
		var node = this;
		Node.SOCK_EVENTS.map( ( eventID )=>{
			var handler = this[`sock_${eventID}`];
			if( handler ){
				node.socket.on( eventID, (event, rinfo)=>{ handler( event, rinfo, node)} );
			}
		})
	}


/*
	Dear code
	The girl I like just sent me a snap of her hanging
	out at another dude's house. Generally, I wouldn't
	mind, but this dude has been hitting on her for a
	while.

	He fucking told her to send nudes and she went off
	but she deleted those posts so I'm assuming they
	made up? This girl is trouble. I should just stay
	away for now. She's crowded up my mind and hasn't
	done anything good for me...

	I'm upset. I'm filled with regret. Regret that I
	spent so much time thinking about her and she just
	goes with someone like him.

	I'm not dissapointed in myself.

	I don't think I am at least...
*/



	terminate( reason ){
		console.log("Terminating node...", `[${reason}]`);
		this.socket.close();
		process.exit();
	}

	connect( address, port, phash, callback ){
		var auth_request = this.pkt_auth_request( this, 'phash' );
		this.send( auth_request, {address: address, port: port }, callback );
	}

	// Data must be string
	send( data, rinfo, callback ){
		vb.log(`send_${data.protocol}`, data, rinfo);
		var dataString = JSON.stringify(data);
		this.socket.send(
			dataString,
			0,
			dataString.length,
			rinfo.port,
			rinfo.address,
			callback
		);
	}

	// Makes sure connection to host is alive
	heartbeat( self ){
		self.heartbeatCounter++;
		if(self.heartbeatCounter==10){
			console.log("Lost connection to host.");
			self.terminate( "Lost hartbeat" );
		}
		self.send( self.pkt_heartbeat( self ), self.host );
	}






	// Socket event handlers
	sock_message( msg, rinfo, self ){
		var data = JSON.parse( msg.toString() ),
				protocol = self[ `msg_${ data.protocol }` ];
		vb.log(`recieve_${data.protocol}`, data, rinfo );
		if( protocol ){
			protocol( data, rinfo, self );
		}
	}

	sock_listening( event, _ignore, self ){
		console.log( `listening... Socket address: \n - ${JSON.stringify(self.socket.address())}\nNetwork Interface Addresses:\n - ${ addresses.join( "\n - " ) }` );
	}

	sock_error( event, _ignore, self ){

	}

	sock_close( event, _ignore, self ){

	}


	// [ctrl+f] msg_mousemove helpers
	// Mouse move events
	mouse_outofbounds( d /*delta*/ ){
		// Calculate where mouse will end up
		this.send( this.pkt_return_control( this, this.mousePos ), this.host );
	}

	whenMouseOOB( x,y, callback ){
		if( !x.inBounds( 1,this.size.width-2 )
			|| !y.inBounds( 1,this.size.height-2 ) ){
				this.controller.moveMouse( 100,100 );
				callback();
				// Find edge, and trasnfer control
		}
	}

	// Chnage the mouse position
	alterMPosition( d ){
		this.mousePos.x -= d.x;
		this.mousePos.y -= d.y;
		this.whenMouseOOB(  this.mousePos.x, this.mousePos.y,
			()=>{this.mouse_outofbounds( d );}
		);
		this.controller.moveMouse( this.mousePos.x, this.mousePos.y );
	}



}

module.exports = Node;


/*
	I don't have a diary, so this will do.

	Dear code,
	There's this girl that's interested in me
	and I made the mistake of giving a stupid
	reply to one of her instagram stories.
	She asked "if you could smash anybody,
	who would it be?".

	I jokingly answered "chaeyoung" who's This
	really cute kpop star.

	I'm not a huge fan of kpop myself, but this
	might have come off as a red flag to her
	because she replied with the cringe emoji.

	This wouldn't have been such a big deal if
	I hadn't followed up with "Also you, because
	you're just as precious". To which she replied
	"...I hope you're not serious, but I think
	you're serious. Whaaaaaaaat"

	We talked a bit after that, she confessed to
	having interest in me and confirmed that She
	still thinks that way and I told her I felt
	the same way.

	I talked to her yesterday. It wasn't anything
	fancy, just casual talk. She told me my texting
	game was "poop" so I tried making up for it
	by giving my texts character.

	But today, she hasn't texted me at all and
	I'm overthinking it, bit I'm afriad she's
	gotten over me by now.
*/
