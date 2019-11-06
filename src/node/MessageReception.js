var MessageFactory = require("./MessageFactory.js");
class MessageReciever extends MessageFactory{
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
}

module.exports = NodeReciever;