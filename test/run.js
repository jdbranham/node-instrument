'use strict';

require('should');
var common = require('./common');

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



