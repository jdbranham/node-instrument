var dgram = require('dgram');
var net = require('net');
var url = require('url');

var protocol = {
		udp4: 'udp4',
		tcp4: 'tcp4'
};

module.exports = CarbonClient;
function CarbonClient(properties) {
	properties = properties || {};

	this._type = properties.type || protocol.udp4;
	this.carbonPort = properties.carbonPort || 2003;
	this.carbonHost = properties.carbonHost || '127.0.0.1';
	this.localIp = properties.localIp || '0.0.0.0';
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
	var socket = net.createConnection({
		port: this.carbonPort,
		host: this.carbonHost,
		localAddress: this.localIp
	}, function(){
		socket.write(message, cb);
		socket.end();
	});
};

CarbonClient.prototype.writeUdp4 = function(metrics, timestamp, cb){
	var socket = dgram.createSocket('udp4');
	var message = this.metricsToBuffer(metrics, timestamp);
	socket.send(message, 0, message.length, this.carbonPort,
			this.carbonHost, cb);
	socket.close();
};

CarbonClient.prototype.metricsToBuffer = function(metrics, timestamp) {
	var lines = '';
	for ( var path in metrics) {
		var value = metrics[path];
		lines += [ path, value, timestamp ].join(' ') + '\n';
	}
	return new Buffer(lines);
};
