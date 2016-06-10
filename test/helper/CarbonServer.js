var dgram = require('dgram'),
	common = require('../common'),
	net = require('net'),
	util = require('util'),
	protocol = {
	udp4: 'udp4',
	tcp4: 'tcp4'
};


var log = function(message, isErr) {
	var logPrefix = '[CARBON SERVER] ';
	if(isErr){
		console.error(logPrefix + message);
	} else{
		console.log(logPrefix + message);
	}
};


function CarbonServer(options, next) {
	var defaults = {
			protocol: protocol.udp4, // or tcp4
			port: common.instrumentOptions.carbonPort,
			host: common.instrumentOptions.carbonHost,
	};
	
	log('entering constructor');
	if(!options && !next){
		throw new Error('options and a callback are required');
	}
	log('extending options');
	options = util._extend(defaults, options);
	var _self = this;
	this.metrics = [];
	this.options = options;
	
	if(options.protocol == protocol.udp4){
		log('creating udp server');
		this.createUdp4Server(options, next);
	} else if(options.protocol == protocol.tcp4){
		log('creating tcp server');
		this.createTcpServer(options, next);
	} else {
		return next(Error('invalid protocol'));
	}
}

CarbonServer.prototype.createUdp4Server = function(options, next){
	var _self = this;
	log('creating datagram socket');
	this.server = dgram.createSocket('udp4');

	log('attaching message event to udp server');
	this.server.on('message', function (message, remote) {
	    log(remote.address + ':' + remote.port +' - ' + message);
	});
	this.server.bind(options.port, options.host, function(err){
		if(err){
			return next(err);
		}
		var address = _self.server.address();
		log('UDP Server listening on ' + address.address + ":" + address.port);
		return next(null, _self);
	});
};

CarbonServer.prototype.createTcpServer = function(options, next){
	var _self = this;
	this.server = net.createServer(function(c){
		log('TCP server received message: ' + util.inspect(c));
		c.on('end', function() {
		    log('client disconnected');
		  });
		options.callback && options.callback();
	});
	this.server.listen({
		host: options.host,
		port: options.port
	}, function(err){
		if(err){
			log(err, true);
			return next(err);
		}
		log('TCP Server listening on ' + options.host + ":" + options.port);
		return next(null, _self);
	});
};

CarbonServer.prototype.on = function(eventName, listenerCallback){
	this.server.on(eventName, listenerCallback);
};

CarbonServer.prototype.removeListener = function(eventName, listenerCallback){
	this.server.removeListener(eventName, listenerCallback);
};

CarbonServer.prototype.close = function(callback) {
	this.server.close(function(err){
		this.server = null;
		callback && callback();
	});
};


module.exports = function(options, next){
	return new CarbonServer(options, next);
};