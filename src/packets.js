// Recursively updates primitive attributes
Object.update = function( from, to ){
	Object.assign( from, to );
	Object.keys( from ).map( (key)=>{
		if( typeof( from[key] ) == "object" ){
			Object.update( from[key], to[key] );
		}else{
			to[key] = from[key];
		}
	});
}

// Exception includes an option to register the packet on-exception
class UnregisteredPacketError extends Error{
	constructor( pktIdentifier, registry, data ){
		super( `Unregistered packet "${pktIdentifier}"` );
		this.pktIdentifier = pktIdentifier;
		this.registry = registry;
		this.data = data;
	}

	register(){
		this.registry.registerPacket( this.pktIdentifier, this.data );
	}
}

class PacketRegistry{
	constructor(){
		var registry = this;

		registry.packets = {};
	}

	// Update a packet
	update( pktIdentifier = "default", data, callback){
		// IF the packet doesn't exist
		if( !!!this.packets[ pktIdentifier ] ){
			//throw new UnregisteredPacketError( pktIdentifier, this, data );
		}


		// Alters values, adds new values
		Object.update( data, this.packets[ pktIdentifier ] );

		// This is where the packets get distributed once the data is changed
		callback( JSON.stringify( this.packets[ pktIdentifier ] ) );

	}

	// Register a packet
	register( pktIdentifier = "default", data, callback){

		// Lazy, This should be changed to optimize cleanup times
		this.packets[ pktIdentifier ] = data;

		// Should be used to distribute packets
		if(callback){
			callback( JSON.stringify( this.packets[ pktIdentifier ] ) );
		}
	}

	pack( pktIdentifier ){
		return JSON.stringify( this.packets[ pktIdentifier ] );
	}
}

module.exports = PacketRegistry;

function example(){
	var pktRegistry = new PacketRegistry();

	// Register a new eventMouseMove packet
	pktRegistry.registerPkt( "eventMouseMove", {
					id:0,
					data:{},
					s:Math.random()
	});

	// the mouse is moved
	pktRegistry.updatePkt( "eventMouseMove", {
					id:0,
					data:{},
					s:Math.random()
	});
}
