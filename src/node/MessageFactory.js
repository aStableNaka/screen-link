class MessageFactory{
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
    
    pkt_$( protocol, data = {} ){
		var out = {
			protocol: protocol,
			salt: Math.random(),
			date: new Date().getTime()
		};
		Object.assign(out, data)
		return out;
	}
}

module.exports = MessageFactory;