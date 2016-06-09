var common = exports;
var path   = require('path');

common.port = process.env.NI_CARBON_PORT || 45032;
common.instrumentOptions = {
	carbonHost : process.env.NI_CARBON_HOST || '127.0.0.1',
	carbonPort : common.port,
	verbose : process.env.NI_CARBON_PORT || true,
	prefix : process.env.NI_PREFIX || 'prefix',
	suffix : process.env.NI_SUFFIX || 'suffix',
	interval : process.env.NI_INTERVAL || 3000,
	//multicast : $multicast_ip_address, // either false or ip address
	broadcast: '127.0.0.1',
	localIp: '127.0.0.1',
	localPort: '8000',
	callback : function(err) {
		if(err) console.log(err);
	}
}

common.dir      = {}
common.dir.root = path.dirname(__dirname);
common.dir.lib  = path.join(common.dir.root, 'lib');

common.graphite  = require(common.dir.lib + '/GraphiteClient');

common.carbonDsn = 'plaintext://localhost:' + common.port + '/';
common.carbonClient = require(common.dir.lib + '/CarbonClient');
common.instrument = require(common.dir.root)(common.instrumentOptions);
