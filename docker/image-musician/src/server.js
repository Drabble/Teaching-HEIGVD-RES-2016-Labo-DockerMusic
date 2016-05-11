/*
 This program simulates a musician, which emits a particular sound to
 a multicast group depending on which instrument he is playing. 
 Usage: to start a musician, type the following command in a terminal
        (of course, you can run several musicians in parallel and observe that all
        sounds are transmitted via the multicast group):
   node server.js instrument_type

   instrument_type can be : piano, trumpet, flute, violin or drum


*/

/*
 * We have defined the multicast address and port in a separate protocol file
 */
var protocol = require('./protocol');

/*
 * We use a standard Node.js module to work with UDP
 */
var dgram = require('dgram');

/*
 * Simple package for generating compliant with RFC4122
 */
var uuid = require('node-uuid');

/*
 * Let's create a datagram socket. We will use it to send our UDP datagrams 
 */
var s = dgram.createSocket('udp4');

/*
 * Let's define a javascript class for our musician. The constructor accepts
 * a sound and an instrument_type
 */
function Musician(sound, instrument) {

	this.sound = sound;
	this.activeSince = new Date().toISOString();
	this.uuid = uuid.v4();
	this.instrument = instrument;

/*
   * We will emit a packet representing a musician's sound on a regular basis. That is something that
   * we implement in a class method (via the prototype)
   */
	Musician.prototype.update = function() {
		
		/*
		 * Let's create a dynamic javascript object, reprensenting a single sound emitted by the musician
		 * We added 4 properties (the uuid of the musician, the sound emitted, the instrument played and 
		 * the time since it has started playing)
		 * Then we serialize the object to a JSON string
		 */
		var musician = {
			uuid: this.uuid,
			sound: this.sound,
			instrument: this.instrument,
			activeSince : this.activeSince
		};
		var payload = JSON.stringify(musician);

		/*
	     * Finally, let's encapsulate the payload in a UDP datagram, which we publish on
	     * the multicast address. All subscribers to this address will receive the message.
	     */
		message = new Buffer(payload);
		s.send(message, 0, message.length, protocol.PROTOCOL_PORT, protocol.PROTOCOL_MULTICAST_ADDRESS, function(err, bytes) {
			console.log("Sending payload: " + payload + " via port " + s.address().port);
		});

	}

	/*
	 * Let's send a sound every 1000 ms
	 */
	setInterval(this.update.bind(this), 1000);
}

/*
 * Let's set the musician's sound based on the command line argument instrument_type
 * 
 */
var type = process.argv[2];

/*
 * Let's define the sound depending on the musician
 * Throw an exception if the musician's name is undefined
 */

var map = {"piano":"ti-ta-ti","trumpet":"pouet","flute":"trulu","violin":"gzi-gzi","drum":"boum-boum"}

function get(s){
	return map[s];
}
if(type in map){
	sound = get(type); //sound is a globa variable
}else{
	throw "You must add a valid instrument to the parameters";
}

/*
 * Let's create the new musician 
 */
var m = new Musician(sound, type);