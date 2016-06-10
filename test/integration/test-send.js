var common = require('../common');
var assert = require('assert');
var path = require('path');
var prefix = common.instrumentOptions.prefix;
var suffix = common.instrumentOptions.suffix;
var util = require('util');
var when = require('when');

var udpServer, tcpServer;

var metricArray = [];
var metrics = {
	foo : 1,
	deep : {
		down : {
			a : 2,
			b : 3,
		}
	}
};

var parseLine = function(line) {
	var parts = line.split(/ /g);
	metricArray.push({
		path : parts[0],
		value : parts[1],
		timestamp : parseInt(parts[2], 10),
	});
};

var log = function(msg){
	console.log('[test-send] '+ msg);
}

var startServers = function(){
	log('Entering startServers');
	var deferreds = [];

	var tcpServerPromise = when.promise(function(resolve, reject){
		require('../helper/CarbonServer')({port: common.port2, protocol: 'tcp4'}, function(serverErr, server){
			if(serverErr){
				console.error(serverErr);
				return reject(serverErr);
			} 
			tcpServer = server;
			return resolve();
		});
	});
	deferreds.push(tcpServerPromise);
	
	var udpServerPromise = when.promise(function(resolve, reject){
		require('../helper/CarbonServer')({port: common.port}, function(serverErr, server){
			if(serverErr){
				console.error(serverErr);
				return reject(serverErr);
			} 
			udpServer = server;
			return resolve();
		});
	});
	deferreds.push(udpServerPromise);
	
	log('Created server promises' + util.inspect(deferreds));

	return when.all(deferreds);
};

describe('integration tests', function(){
	
	before(function(done){
		log('beforeAll');
		startServers().then(function(){
			done();
		});
	});
	
	after(function(done){
		udpServer.close();
		tcpServer.close();
		done();
	});
	
	describe('udp', function(){
		it('should send manually', function(done){
			var instrument = common.instrument({
				callback: function(){
					instrument.stop();
					instrument.close();
				}
			});
			var onMessage = function(buffer, remote) {
				udpServer.removeListener('message', onMessage);
				var message = buffer.toString();
				while (message.length) {
					var index = message.indexOf('\n');
					if (index === -1)
						break;

					var line = message.substr(0, index);
					message = message.substr(index + 1);
					parseLine(line);
				}

				var metric = metricArray.shift();
				metric.path.should.be.exactly(prefix + '.foo.' + suffix);
				metric.value.should.equal('1');
				(metric.timestamp + 10000 >= Date.now() / 1000).should.be.true();
				(metric.timestamp - 10000 <= Date.now() / 1000).should.be.true();

				metric = metricArray.shift();
				metric.path.should.be.exactly(prefix + '.deep.down.a.' + suffix);
				metric.value.should.be.exactly('2');
				(metric.timestamp + 10000 >= Date.now() / 1000);
				(metric.timestamp - 10000 <= Date.now() / 1000);

				metric = metricArray.shift();
				metric.path.should.be.exactly(prefix + '.deep.down.b.' + suffix);
				metric.value.should.be.exactly('3');
				(metric.timestamp + 10000 >= Date.now() / 1000).should.be.true();
				(metric.timestamp - 10000 <= Date.now() / 1000).should.be.true();
				console.log('completed assertions');
				return done();
			};
			
			udpServer.on('message', onMessage);
			instrument.addObject(metrics);
			instrument.send();
			console.log('beginning assertions');
			
		});
		
		it('should send on an interval', function(done){
			var instrument = common.instrument({
				callback: function(){
					instrument.stop();
					instrument.close();
				}
			});
			var onMessage = function(buffer, remote) {
				udpServer.removeListener('message', onMessage);
				buffer.should.not.be.null();
				return done();
			};
			
			udpServer.on('message', onMessage);
			instrument.send();
			instrument.addObject(metrics);
			instrument.start();
		});
	});
	
	describe('tcp', function(){
		it('should send via tcp', function(done){
			var instrument = common.instrument({
				callback: function(){
					instrument.stop();
					instrument.close();
				},
				type: 'tcp4', 
				carbonHost: common.instrumentOptions.carbonHost, 
				carbonPort: common.port
			});
			
			var onMessage = function(buffer) {
				log('tcp message handled');
				tcpServer.removeListener('data', onMessage);
				buffer.should.not.be.null();
				return done();
			};
			
			tcpServer.on('data', onMessage);
			instrument.send();
			instrument.addObject(metrics);
			instrument.start();
		});
	});

});

