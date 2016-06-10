var dgram = require('dgram');
var net = require('net');
var url = require('url'),
	util = require('util');

var protocol = {
		udp4: 'udp4',
		tcp4: 'tcp4'
};

var log = function(msg, isErr){
	var logKey = '[CarbonClient] ';
	if(isErr){
		console.error(logKey + msg);
	} else{
		if(process.env.NI_VERBOSE)
			console.log(logKey + msg);
	}
}

var socketErrorHandler = function(err){
	log(err, true);
};

module.exports = CarbonClient;
function CarbonClient(properties) {
	properties = properties || {};

	this._type = properties.type;
	this.carbonPort = properties.carbonPort;
	this.carbonHost = properties.carbonHost;
	this.localAddress = properties.localAddress;
}

CarbonClient.prototype.write = function(metrics, timestamp, cb) {
	
	if(this._type == protocol.tcp4){
		this.writeTcp4(metrics, timestamp, cb);
	} else {
		this.writeUdp4(metrics, timestamp, cb);
	}
	
};

CarbonClient.prototype.writeTcp4 = function(metrics, timestamp, cb){
	var self = this;
	var message = this.metricsToBuffer(metrics, timestamp);
	log('creating tcp socket connection: port ' + this.carbonPort + ' host: ' + this.carbonHost);
	var socket = net.createConnection({
		port: this.carbonPort,
		host: this.carbonHost,
		localAddress: this.localAddress
	}, function(err){
		if(err){
			log(err, true);
			return cb && cb(err);
		}
		log('writing to tcp socket...');
		socket.write(message, function(err, bytes){
			socket.end();
			log('finished writing to tcp socket');
		});
	});
	// callback is executed after the TCP response is received
	socket.on('data', function(bytes){
		log('received response from server: ' + bytes);
		socket.destroy();
		log('executing callback');
		return cb && cb(null, bytes);
	});
};

CarbonClient.prototype.writeUdp4 = function(metrics, timestamp, cb){
	log('creating udp socket: port ' + this.carbonPort + ' host: ' + this.carbonHost);
	
	var socket = dgram.createSocket(protocol.udp4);
	socket.on('error', socketErrorHandler);
	
	var message = this.metricsToBuffer(metrics, timestamp);
	log('writing to udp socket...');
	log(message);
	socket.send(message, 0, message.length, this.carbonPort,
			this.carbonHost, function(err, bytes){
		if(err){
			log(err, true);
			return cb && cb(err);
		}
		socket.close();
		log('finished writing to udp socket');
		log(util.inspect(bytes));
		return cb && cb(null, bytes);
	});
};

CarbonClient.prototype.metricsToBuffer = function(metrics, timestamp) {
	var lines = '';
	for ( var path in metrics) {
		var value = metrics[path];
		lines += [ path, value, timestamp ].join(' ') + '\n';
	}
	return new Buffer(lines);
};
