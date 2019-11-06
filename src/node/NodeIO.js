var MessageReception = require("./MessageReception.js");
class NodeIO extends MessageReception{
    registerSocketHandlers(){
		var node = this;
		Node.SOCK_EVENTS.map( ( eventID )=>{
			var handler = this[`sock_${eventID}`];
			if( handler ){
				node.socket.on( eventID, (event, rinfo)=>{ handler( event, rinfo, node)} );
			}
		})
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

    // Emergency exit
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
}