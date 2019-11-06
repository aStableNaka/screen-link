class VerboseLogger{
	constructor( config, enable ){
		this.config = config;
		this.enable = enable;
	}
	log( protocol, ...data ){
		if(!this.enable){return;}
		if( this.config[protocol] ){
			console.log.apply( null, [`[VB:${protocol}]`, ...data] );
		}
	}
}

module.exports = VerboseLogger;
