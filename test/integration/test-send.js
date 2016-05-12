var common         = require('../common');
var assert         = require('assert');
var CarbonServer   = require('../helper/CarbonServer');

var server = new CarbonServer();

var instrument = common.instrument({
	carbonHost: '127.0.0.1',
	verbose: true,
	carbonPort : common.port,
	prefix : 'test.unit'
});

var metrics = {
	foo : 1,
	deep : {
		down : {
			a : 2,
			b : 3,
		}
	}
};

module.exports = {
	setUp : function(callback) {
		server.listen(common.port, function(){
			callback();
		});
	},
	tearDown : function(callback) {
		server.close();
		callback();
	},
	'#send' : function(test) {		
		instrument.addObject(metrics);
		instrument.stop();
		
		console.log('beginning assertions');
		console.log(server);
		
		var metric = server.metrics.shift();
		test.equal(metric.path, 'foo');
		test.equal(metric.value, 1);
		test.ok(metric.timestamp + 1 >= Date.now() / 1000);
		test.ok(metric.timestamp - 1 <= Date.now() / 1000);
		
		metric = server.metrics.shift();
		test.equal(metric.path, 'deep.down.a');
		test.equal(metric.value, 2);
		test.ok(metric.timestamp + 1 >= Date.now() / 1000);
		test.ok(metric.timestamp - 1 <= Date.now() / 1000);
		
		metric = server.metrics.shift();
		test.equal(metric.path, 'deep.down.b');
		test.equal(metric.value, 3);
		test.ok(metric.timestamp + 1 >= Date.now() / 1000);
		test.ok(metric.timestamp - 1 <= Date.now() / 1000);
		console.log('completed assertions');
		return test.done();
	}
}