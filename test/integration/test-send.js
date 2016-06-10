var common = require('../common');
var assert = require('assert');
var path = require('path');
var prefix = common.instrumentOptions.prefix;
var suffix = common.instrumentOptions.suffix;
var util = require('util');
var when = require('when');

var carbonServer;

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
	if(process.env.NI_VERBOSE)
		console.log('[test-send] '+ msg);
}

var startServers = function(){
	log('Creating new CarbonServer');
	
	var carbonServerPromise = when.promise(function(resolve, reject){
		require('../helper/CarbonServer')({port: common.port}).then(function success(server){
			log('assigning returned server to local variable "carbonServer"');
			carbonServer = server;
			return resolve();
		}, function failure(err){
			console.error(util.inspect(err));
			return reject(err);
		});
	});
	
	log('Created carbonServer promise' + util.inspect(carbonServerPromise));

	return carbonServerPromise;
};

describe('integration tests', function(){
	
	before(function(done){
		log('beforeAll');
		startServers().then(function(){
			done();
		}, function failure(err){
			console.error(err);
			done(err);
		});
	});
	
	after(function(done){
		carbonServer.close();
		done();
	});
	
	describe('udp', function(){
		it('should send manually', function(done){
			var instrument = common.instrument();
			var onMessage = function(buffer, remote) {
				carbonServer.removeListener('udpMessage', onMessage);
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
				log('completed assertions');
				return done();
			};
			
			instrument.setCallback(null);
			carbonServer.on('udpMessage', onMessage);
			instrument.addObject(metrics);
			instrument.send();
			log('beginning assertions');
			
		});
		
		it('should send on an interval', function(done){
			var instrument = common.instrument();
			var onMessage = function(buffer, remote) {
				carbonServer.removeListener('udpMessage', onMessage);
				instrument.stop();
				buffer.should.not.be.null();
				return done();
			};
			instrument.setCallback(null);
			carbonServer.on('udpMessage', onMessage);
			instrument.addObject(metrics);
			instrument.start();
		});
	});
	
	describe('tcp', function(){
		it('should send via tcp', function(done){
			var instrument = new common.instrument({
				type: 'tcp4',
				localAddress: '0.0.0.0',
				carbonHost: '127.0.0.1',
				carbonPort: common.instrumentOptions.carbonPort
			});
			var onMessage = function(err, bytes) {
				log(err);
				log(bytes);
				should.not.be.null(bytes);
				return done();
			};

			instrument.setCallback(onMessage);
			instrument.addObject(metrics);
			instrument.send();
		});
	});

});

