Number.prototype.random = function(){
	return Math.floor(this*Math.random());
}

const dgram = require("dgram");
const client = dgram.createSocket("udp4");
var counter = 0,
		trials = 10000,
		sum = 0,
		packet = "",
		rec = [],

// Statistics
		t = 10,
		means= [],
		medians= [],
		tc = 0;

createPacket = function(){
	return {
		from:{x:(3000).random(),y:(2000).random()},
		to:{x:(3000).random(),y:(2000).random()},
		delta:{x:(3000).random(),y:(2000).random()},
		date: new Date().getTime()
	}
}

callb = function(){
	if(packet == "close"){
		rec.sort();
		var median = rec[Math.floor(rec.length/2)],
				mean = sum/rec.length;
		if(tc < t){
			tc++;
			means.push(mean);
			medians.push(median);
			rec = [],
			sum = 0;
			counter = 0;
		}else{
			client.close()
			console.log("Median latencey:", means)
			console.log("Mean latencey:", medians);
		}

	}
}

client.on("message", (msg, rinfo)=>{
	counter++;
	packet = createPacket();
	var data = JSON.parse(msg);
	if(counter>=trials){
		packet = "close";
	}

	var latencey = packet.date - parseInt(msg.toString());
	rec.push(latencey);
	if(!Number.isNaN(latencey)){
		sum+=latencey;
	}

	var packetStr = JSON.stringify( packet );
	console.log(msg.toString(), latencey, rinfo, counter);
	client.send(packetStr, 0, packetStr.length, rinfo.port, rinfo.address, callb);
})

client.on("listening", ()=>{

})

packet = JSON.stringify( createPacket() );


client.send(packet, 0, packet.length, 12349, "0.0.0.0" );
