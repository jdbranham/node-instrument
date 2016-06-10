var common = exports;
var path   = require('path');
var util = require('util');

common.port = process.env.NI_CARBON_PORT || 45032;
common.instrumentOptions = {
	carbonHost : process.env.NI_CARBON_HOST || '127.0.0.1',
	carbonPort : common.port,
	verbose : process.env.NI_VERBOSE || true,
	prefix : process.env.NI_PREFIX || 'prefix',
	suffix : process.env.NI_SUFFIX || 'suffix',
	interval : process.env.NI_INTERVAL || 1000,
	localAddress: process.env.NI_LOCALADDRESS || '0.0.0.0',
	callback : function(err) {
		if(err) console.log(err);
	}
}

common.dir      = {}
common.dir.root = path.dirname(__dirname);
common.dir.lib  = path.join(common.dir.root, 'lib');

common.graphite  = require(common.dir.lib + '/GraphiteClient');

common.carbonClient = require(common.dir.lib + '/CarbonClient');
common.instrument = function(options){
	options = options || {};
	var _options = util._extend(common.instrumentOptions, options);
	return new require(common.dir.root)(_options);
};
