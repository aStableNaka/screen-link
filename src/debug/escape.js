function checkForEscapeKey( event ){
	console.log( event );
}

module.exports = function(){
	document.body.addEventListener("keypress", checkForEscapeKey);
}
