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