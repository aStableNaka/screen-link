const ScreenNode = require("./node.js");
const dgram = require("dgram");

class Host extends ScreenNode{


	// Automatically allows all connections
	// Change to require a password
	msg_auth_request( data, rinfo, self ){
		self.edges.fill( rinfo );
		self.send( self.pkt_auth_host( self, true, 0, self.nodes.length ), rinfo );
	}

	// When the other screen/s are ready
	msg_ready( data, rinfo, self ){
		if( !self.hLock.start ){
			if(!self.focusNode){
				// transfer control when the mouse is on the edge
				self.focusNode = rinfo;
				self.hook.start();
			}
		}
	}

	msg_return_control( data, rinfo, self ){
		self.controller.moveMouse(
			data.pos.x + self.size.width % self.size.width,
			data.pos.y + self.size.height % self.size.height );
		self.returnControl( rinfo );
	}

	transferControl( rinfo ){
		this.focus = false;
		this.hLock.start = true;
		this.hook.disableClickPropagation();
	}

	returnControl( rinfo ){
		this.focus = true;
		this.hLock.start = false;
		this.hook.enableClickPropagation();
	}

	msg_heartbeat( data, rinfo, self ){
		self.send( self.pkt_heartbeat( self ), rinfo );
	}

	// Node1 oob -> host rch -> Node1 tfc
	// Host -> node2 tfc
	msg_route_control_host( data, rinfo, self ){

	}




	// IO Hooks
	hook_mousemove( self, event ){
		if( self.focus ){
			self.whenMouseOOB(event.x, event.y, ()=>{
				self.transferControl( self.nodes[0] );
			})
			return;
		}
		if( !self.hLock.mousemove && !self.hLock.mouserelease ){
			self.hLock.mousemove = true;

			// Change this to use packet.js
			self.send(
				self.pkt_mousemove(								// Package
					self, event,											// Self, event
					self.calculateMMDeltas( event )			// Delta
				),
				self.focusNode,										// Destination
				()=>{															// Callback
					self.revertMousePos();						// Return mouse to base pos for next delta
					self.releaseMouseMoveHookLock();						// Release lock
				}
			);
		}
	}// [ctrl+f] hook_mousemove helpers

	hook_mousedown( self, event ){
		if(self.focus){return;}
		self.send( self.pkt_mousedown( self, event ), self.focusNode );
	}

	hook_mouseup( self, event ){
		if(self.focus){return;}
		self.send( self.pkt_mouseup( self, event ), self.focusNode );
	}

	hook_mousedrag( self, event ){
		if( self.focus ){return;}
		if( !self.hLock.mousedrag && !self.hLock.mouserelease ){
			self.hLock.mousedrag = true;

			// Change this to use packet.js
			self.send(
				self.pkt_mousedrag(								// Package
					self, event,											// Self, event
					self.calculateMMDeltas( event )			// Delta
				),
				self.focusNode,										// Destination
				()=>{															// Callback
					self.revertMousePos();						// Return mouse to base pos for next delta
					self.releaseMouseDragHookLock();						// Release lock
				}
			);
		}
	}




	static get HOOKS(){return [
		"mousemove",
		"mousedown",
		"mouseup",
		"mousewheel",
		"keydown",
		"keyup",
		"mousedrag"
	]};

	constructor(){
		super();
		var self = this;
		this.focus = true; // true;
		this.focusNode = null; // rinfo
		this.nodes = [];
		this.pos = this.controller.getMousePos();

		this.hLock = {
			start: false,
			mousemove: false,
			mouserelease: false
		};

		this.basePos = {
			x:self.size.width/2,
			y:self.size.height/2
		}
		console.log(this.basePos);

		this.hook = require("iohook");

		this.setupHooks();
		this.socket.bind( 17822 );

		this.hook.on("keydown", this.checkForEscapeKey);
	}


	checkForEscapeKey( event ){
		if( event.keycode == 1 ){
			process.exit();
		}

	}

	setupHooks(){
		var host = this;
		Host.HOOKS.map( ( hook )=>{
			if(host[`hook_${hook}`]){
				this.hook.on( hook,
					(event)=>{
						host[`hook_${hook}`]( host, event );
					});
			}
		});
	}

	// [ctrl+f] transfer_control helpers



	// [ctrl+f] hook_mousemove helpers
	// Release the lock on the event hook
	releaseMouseMoveHookLock(){
		var self = this;
		setTimeout( ()=>{
			self.hLock.mousemove = false;
		},1)
	}

	releaseMouseDragHookLock(){
		var self = this;
		setTimeout( ()=>{
			self.hLock.mousemove = false;
		},1)
	}

	// Puts mouse back to base position
	revertMousePos(){
		this.controller.moveMouse(
			this.basePos.x,
			this.basePos.y
		);
	}

	// Calculates the change in mouse position
	calculateMMDeltas( event ){
		var self = this;
		return {
			x:self.basePos.x - event.x,
			y:self.basePos.y - event.y
		}
	}

}

var hostScreen = new Host();
