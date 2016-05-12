var common = exports;
var path   = require('path');
var net = require('net');

var portrange = 45032

function getPort (cb) {
  var port = portrange
  portrange += 1

  var server = net.createServer()
  server.listen(port, function (err) {
    server.once('close', function () {
      cb(port)
    })
    server.close()
  })
  server.on('error', function (err) {
    getPort(cb)
  })
}
getPort(function(port) {
	common.port = port;
});

common.dir      = {}
common.dir.root = path.dirname(__dirname);
common.dir.lib  = path.join(common.dir.root, 'lib');

common.graphite  = require(common.dir.lib + '/GraphiteClient');

common.carbonDsn = 'plaintext://localhost:' + common.port + '/';
common.carbonClient = require(common.dir.lib + '/CarbonClient');
