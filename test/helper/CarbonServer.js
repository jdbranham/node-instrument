var dgram = require('dgram');
var server = dgram.createSocket('udp4');
var common = require('../common');
var PORT = common.instrumentOptions.carbonPort;
var HOST = common.instrumentOptions.carbonHost;

var log = function(message) {
	console.log('[CARBON SERVER] ' + message);
};

module.exports = new CarbonServer();
function CarbonServer() {
	this.metrics = [];
	
	server.on('listening', function () {
	    var address = server.address();
	    console.log('UDP Server listening on ' + address.address + ":" + address.port);
	});

	server.on('message', function (message, remote) {
	    console.log(remote.address + ':' + remote.port +' - ' + message);
	});
}

CarbonServer.prototype.on = function(eventName, listenerCallback){
	server.on(eventName, listenerCallback);
};

CarbonServer.prototype.removeListener = function(eventName, listenerCallback){
	server.removeListener(eventName, listenerCallback);
};

CarbonServer.prototype.listen = function(port, cb) {
	log('Binding server on port: ' + port);
	server.bind(PORT, HOST, cb);
};

CarbonServer.prototype.close = function(callback) {
	log('Closing server');
	server.close(callback);
};