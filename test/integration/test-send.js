var common         = require('../common');
var assert         = require('assert');
var CarbonServer   = require('../helper/CarbonServer');
var path   = require('path');

var server = new CarbonServer();

var instrument = require(common.dir.root)({
	carbonHost: 'localhost',
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
		callback();
	},
	tearDown : function(callback) {
		callback();
	},
	'#send' : function(test) {		
		server.listen(common.port, function(){
			instrument.stop();
			instrument.addObject(metrics);
			instrument.send();
			
			console.log(server);
			console.log('beginning assertions');
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
		});
		
	}
}