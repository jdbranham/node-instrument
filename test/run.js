'use strict';

var nodeunit = require('nodeunit'),
	common = require('./common'),
	reporter = nodeunit.reporters.default,
	path = require('path'),
	server = require('./helper/CarbonServer');

function dumpError(err) {
	if (typeof err === 'object') {
		if (err.message) {
			console.error('\nMessage: ' + err.message);
		}
		if (err.stack) {
			console.error('\nStacktrace:')
			console.error('====================')
			console.error(err.stack);
		}
	} else {
	console.error('dumpError :: argument is not an object: ' + err);
	}
}


process.on('uncaughtException', function(err) {
	dumpError(err);
    process.exit(1);
});

nodeunit.on('done', function(){
	server.close(function(){
		process.exit(0);
	});
});

server.listen(common.port, function() {
	reporter.run([path.join(__dirname, 'unit'),
	              path.join(__dirname, 'integration')]);
});



