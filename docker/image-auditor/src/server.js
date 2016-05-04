/*
 This program simulates a "data collection station", which joins a multicast
 group in order to receive measures published by thermometers (or other sensors).
 The measures are transported in json payloads with the following format:
   {"timestamp":1394656712850,"location":"kitchen","temperature":22.5}
 Usage: to start the station, use the following command in a terminal
   node station.js
*/

/*
 * We have defined the multicast address and port in a file, that can be imported both by
 * thermometer.js and station.js. The address and the port are part of our simple 
 * application-level protocol
 */
var protocol = require('./protocol');

/*
 * We use a standard Node.js module to work with UDP
 */
var dgram = require('dgram');
var net = require('net');

var musicians = [];

/* 
 * Let's create a datagram socket. We will use it to listen for datagrams published in the
 * multicast group by thermometers and containing measures
 */
var s = dgram.createSocket('udp4');
s.bind(protocol.PROTOCOL_PORT, function() {
  console.log("Joining multicast group");
  s.addMembership(protocol.PROTOCOL_MULTICAST_ADDRESS);
});

/* 
 * This call back is invoked when a new datagram has arrived.
 */
s.on('message', function(msg, source) {
	console.log("Data has arrived: " + msg + ". Source port: " + source.port);
	var musician = JSON.parse(msg);
	var i;
	var foundMusician = false;
    for (i = 0; i < musicians.length; i++) {
        if (musicians[i].uuid === musician.uuid) {
            // Update last update time
			musicians[i].lastUpdate = new Date();
			foundMusician = true;
        }
    }
	if(foundMusician == false){
		musician.lastUpdate = new Date();
		musicians.push(musician);	
	}
});

function checkMusicians() {
	for (i = 0; i < musicians.length; i++) {
		var dif = new Date().getTime() - musicians[i].lastUpdate.getTime();
		var Seconds_from_T1_to_T2 = dif / 1000;
		var Seconds_Between_Dates = Math.abs(Seconds_from_T1_to_T2);
        if (Seconds_Between_Dates > 5) {
            musicians.splice(i, 1);
        }
    }
}

var server = net.createServer(function(socket) {
	var musiciansJSON = [];
	for (i = 0; i < musicians.length; i++) {
        var musician = {"uuid" : musicians[i].uuid, "instrument" : musicians[i].instrument, "activeSince" : musicians[i].activeSince};
		musiciansJSON.push(musician);
    }
	socket.write(JSON.stringify(musiciansJSON) + "\r\n");
	socket.pipe(socket);
	socket.end('Closing TCP socket\r\n');
});

setInterval(checkMusicians, 1000);
server.listen(2205, '127.0.0.1');