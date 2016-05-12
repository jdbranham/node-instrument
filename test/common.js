var common = exports;
var path   = require('path');

common.dir      = {}
common.dir.root = path.dirname(__dirname);
common.dir.lib  = path.join(common.dir.root, 'lib');

common.graphite  = require(common.dir.lib + '/GraphiteClient');
common.port      = 12523;
common.carbonDsn = 'plaintext://localhost:' + common.port + '/';
common.carbonClient = require(common.dir.lib + '/CarbonClient');
common.instrument = require(common.dir.root);
