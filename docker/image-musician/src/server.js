/*
 This program simulates a "smart" thermometer, which publishes the measured temperature
 on a multicast group. Other programs can join the group and receive the measures. The
 measures are transported in json payloads with the following format:
   {"timestamp":1394656712850,"location":"kitchen","temperature":22.5}
 Usage: to start a thermometer, type the following command in a terminal
        (of course, you can run several thermometers in parallel and observe that all
        measures are transmitted via the multicast group):
   node thermometer.js location temperature variation
*/

var protocol = require('./protocol');

/*
 * We use a standard Node.js module to work with UDP
 */
var dgram = require('dgram');

/*
 * Let's create a datagram socket. We will use it to send our UDP datagrams 
 */
var s = dgram.createSocket('udp4');

function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
};

/*
 * Let's define a javascript class for our thermometer. The constructor accepts
 * a location, an initial temperature and the amplitude of temperature variation
 * at every iteration
 */
function Musician(sound, instrument) {

	this.sound = sound;
	this.activeSince = new Date().toISOString();
	this.uuid = generateUUID();
	this.instrument = instrument;

/*
   * We will simulate temperature changes on a regular basis. That is something that
   * we implement in a class method (via the prototype)
   */
	Musician.prototype.update = function() {
		
		/*
		 * Let's create the measure as a dynamic javascript object, 
		 * add the 3 properties (timestamp, location and temperature)
		 * and serialize the object to a JSON string
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
	 * Let's take and send a measure every 1000 ms
	 */
	setInterval(this.update.bind(this), 1000);

}

/*
 * Let's get the thermometer properties from the command line attributes
 * Some error handling wouln't hurt here...
 */
var type = process.argv[2];
var sound;

switch(type) {
	case "piano":
        sound = "ti-ta-ti";
        break;
	case "trumpet":
        sound = "pouet";
        break;
	case "flute":
        sound = "trulu";
        break;
	case "violin":
        sound = "gzi-gzi";
        break;
    case "drum":
        sound = "boum-boum";
        break;
    default:
        throw "You must add a valid instrument to the parameters";
}

/*
 * Let's create a new thermoter - the regular publication of measures will
 * be initiated within the constructor
 */
var m = new Musician(sound, type);