var dgram = require('dgram');
var url   = require('url');

module.exports = CarbonClient;
function CarbonClient(properties) {
  properties = properties || {};

  this._socket = properties.socket || null;
  this._type = properties.type || 'udp4';
  this.carbonPort = properties.carbonPort || 2003;
  this.carbonHost = properties.carbonHost || '127.0.0.1';
  this.multicast = properties.multicast || false;
}

CarbonClient.prototype.write = function(metrics, timestamp, cb) {
  this.connect();

  var lines = '';
  for (var path in metrics) {
    var value = metrics[path];
    lines += [path, value, timestamp].join(' ') + '\n';
  }
  var message = new Buffer(lines);
  
  this._socket.send(message, 0, message.length, this.carbonPort, this.carbonHost, cb);
};

CarbonClient.prototype.connect = function() {
  if (this._socket) return;
  this._socket = dgram.createSocket(this._type);
  if(this.multicast){
	  this._socket.addMembership(this.multicast);
  }
};

CarbonClient.prototype.close = function() {
  if (this._socket) this._socket.close();
};
