var net = require('net');

var log = function(message) {
	console.log('[CARBON SERVER] ' + message);
};

module.exports = CarbonServer;
function CarbonServer() {
	this.metrics = [];
	this._server = null;
}

CarbonServer.prototype.listen = function(port, cb) {
	if (!this._server) {
		log('Creating a new server on port: ' + port);
		this._server = net.createServer(this._handleSocket.bind(this));
		
		this._server.listen(port, cb);
	}
};

CarbonServer.prototype._handleSocket = function(socket) {
	var self = this;
	var buffer = '';

	socket.setEncoding('utf8');
	socket.on('data', function(chunk) {
		buffer += chunk;

		while (buffer.length) {
			var index = buffer.indexOf('\n');

			if (index === -1)
				break;

			var line = buffer.substr(0, index);
			buffer = buffer.substr(index + 1);

			self._parseLine(line);
		}
	}).on('end', function() {
		self.close();
	});
};

CarbonServer.prototype.close = function(callback) {
	log('Closing server');
	this._server.close(callback);
};


CarbonServer.prototype._parseLine = function(line) {
	var parts = line.split(/ /g);
	this.metrics.push({
		path : parts[0],
		value : parts[1],
		timestamp : parseInt(parts[2], 10),
	});
};