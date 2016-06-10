var dgram = require('dgram'),
	common = require('../common'),
	util = require('util'),
	net = require('net'),
	EventEmitter = require('events'),
	when = require('when');


var log = function(message, isErr) {
	var logPrefix = '[CARBON SERVER] ';
	if(isErr){
		console.error(logPrefix + message);
	} else{
		if(process.env.NI_VERBOSE)
			console.log(logPrefix + message);
	}
};


/**
 * Test server 
 * 
 * events -
 * 	udpMessage
 * 	tcpMessage
 * 
 */
function CarbonServer(options) {
	EventEmitter.call(this);
	var defaults = {
			port: common.instrumentOptions.carbonPort,
			host: common.instrumentOptions.carbonHost,
	};
	
	log('entering constructor');
	log('extending options');
	log('inspecting self: ');
	log(util.inspect(this, {showHidden: true, colors:true}));
	options = util._extend(defaults, options);
	var _self = this;
	this.options = options;
	
	var deferreds = [];	

	deferreds.push(_self.createTcpServer(options));
	deferreds.push(_self.createUdp4Server(options));
	
	log('Created server promises' + util.inspect(deferreds));
	
	var promise = when.promise(function(resolve, reject){
		when.all(deferreds).then(function(){
			log('inspecting servers: ' + util.inspect(_self.tcpServer) + '\n\n' + util.inspect(_self.udpServer));
			return resolve(_self);
		})
	})
	return promise;
}

util.inherits(CarbonServer, EventEmitter);

CarbonServer.prototype.createTcpServer = function(options){
	var _self = this;
	var promise = when.promise(function(resolve, reject){
		log('creating tcp server');
		
		var server = net.createServer(function(sock){
			log('client connected: ' + sock.remoteAddress +':'+ sock.remotePort);
			log('attaching data event to tcp server');
			sock.pipe(sock);
			sock.on('data', function (bytes) {
			    log('TCP server received message: ' + bytes);
			    sock.write(bytes);
			    _self.emit('tcpMessage', bytes);
			});
		}).listen({
			  host: options.host,
			  port: options.port,
			  exclusive: false
			});
		
		server.on('listening', function(){
			log(util.inspect(_self.options));
			log('TCP Server listening on ' + _self.options.host + ":" + _self.options.port);
			_self.tcpServer = server;
			return resolve(server);
		});
	});
	return promise;	
};

CarbonServer.prototype.createUdp4Server = function(options){
	var _self = this;
	var promise = when.promise(function(resolve, reject){
		log('creating datagram socket');
		var server = dgram.createSocket('udp4');

		log('attaching message event to udp server');
		server.on('message', function (message, remote) {
		    log('UDP server received message: ' + remote.address + ':' + remote.port +' - ' + message);
		    _self.emit('udpMessage', message, remote);
		});
		server.bind({
			port: options.port, 
			address: options.host,
			exclusive: false }, function(err){
			if(err){
				return reject(err);
			}
			var address = server.address();
			log('UDP Server listening on ' + address.address + ":" + address.port);
			_self.udpServer = server;
			return resolve(server);
		});
	});
	
	return promise;
};

CarbonServer.prototype.close = function(callback) {
	this.tcpServer.close(function(err){
		this.tcpServer = null;
	});
	this.udpServer.close(function(err){
		this.udpServer = null;
	});
	callback && callback();
};


module.exports = function(options, next){
	return new CarbonServer(options, next);
};