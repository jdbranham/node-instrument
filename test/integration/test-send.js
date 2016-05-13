var common = require('../common');
var assert = require('assert');
var server = require('../helper/CarbonServer');
var path = require('path');
var instrument = common.instrument;
var prefix = common.instrumentOptions.prefix;
var suffix = common.instrumentOptions.suffix;

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

module.exports = {
	setUp : function(callback) {
		callback();
	},
	tearDown : function(callback) {
		callback();
	},
	'# Manual Send' : function(test) {
		
		var onMessage = function(buffer, remote) {
			server.removeListener('message', onMessage);
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
			test.equal(metric.path, prefix + '.foo.' + suffix);
			test.equal(metric.value, 1);
			test.ok(metric.timestamp + 10000 >= Date.now() / 1000);
			test.ok(metric.timestamp - 10000 <= Date.now() / 1000);

			metric = metricArray.shift();
			test.equal(metric.path, prefix + '.deep.down.a.' + suffix);
			test.equal(metric.value, 2);
			test.ok(metric.timestamp + 10000 >= Date.now() / 1000);
			test.ok(metric.timestamp - 10000 <= Date.now() / 1000);

			metric = metricArray.shift();
			test.equal(metric.path, prefix + '.deep.down.b.' + suffix);
			test.equal(metric.value, 3);
			test.ok(metric.timestamp + 10000 >= Date.now() / 1000);
			test.ok(metric.timestamp - 10000 <= Date.now() / 1000);
			console.log('completed assertions');
			return test.done();
		};
		
		server.on('message', onMessage);

		instrument.addObject(metrics);
		instrument.send();
		console.log('beginning assertions');

	},
	'# Interval Send': function(test) {
		var onMessage = function(buffer, remote) {
			server.removeListener('message', onMessage);
			test.ok(buffer != null);
			test.done();
		};
		server.on('message', onMessage);
		instrument.send();
		instrument.addObject(metrics);
		instrument.start();
	}
}