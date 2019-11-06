const dgram = require("dgram");
const os = require("os");
const netIfaces = os.networkInterfaces();
const helpers = require("./helpers.js");
const NodeIO = require("./NodeIO.js");
var addresses = [];



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




class Node extends NodeIO{

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
		//this.pktRegistry =new PacketRegistry(); // Obsolete 
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