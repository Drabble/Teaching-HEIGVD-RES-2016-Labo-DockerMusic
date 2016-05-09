/*
 This program simulates an "auditor", which joins a multicast
 group in order to receive sounds emitted by several musicians.

 The auditor keeps tracks of the active musicians by maintainig an array 
 containing every musician which have emitted at least once during the 
 last five seconds.

 The sound are transported in json payloads with the following format:
   {"uuid": ,"sound": , "instrument":, "activeSince":}
 Usage: to start the station, use the following command in a terminal

   node server.js
*/

/*
 * We have defined the multicast address and port in a separate protocol file
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
 * multicast group by musicians and containing sounds
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
/* 
 * Check if the emitting musician is already present in the active musician's array
 */
    for (i = 0; i < musicians.length; i++) {
        if (musicians[i].uuid === musician.uuid) {
            // Update last update time
			musicians[i].lastUpdate = new Date();
			foundMusician = true;
        }
    } 
/* 
 * If not, we add it
 */    
	if(foundMusician == false){
		musician.lastUpdate = new Date();
		musicians.push(musician);	
	}
});
/* 
 * Remove musicians who have not emitted during the last five seconds from the 
 * active musician's array
 */
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
/* 
 * Returns a list of every active musicians
 */
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
/* 
 * Set the time interval between every check of the active musician's array
 * Here we chosed to check it every second
 */
setInterval(checkMusicians, 1000);
server.listen(2205, '0.0.0.0');