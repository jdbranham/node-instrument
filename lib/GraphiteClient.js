// Source from https://github.com/felixge/node-graphite

var CarbonClient = require('./CarbonClient');

module.exports = GraphiteClient;
function GraphiteClient(properties) {
  this._carbon = properties.carbon;
}

GraphiteClient.createClient = function(properties) {
  var client = new this({
    carbon: new CarbonClient(properties),
  });
  return client;
};

GraphiteClient.flatten = function(obj, flat, prefix) {
  flat   = flat || {};
  prefix = prefix || '';

  for (var key in obj) {
    var value = obj[key];
    if (typeof value === 'object') {
      this.flatten(value, flat, prefix + key + '.');
    } else {
      flat[prefix + key] = value;
    }
  }

  return flat;
};

GraphiteClient.prototype.write = function(metrics, timestamp, cb) {
  if (typeof timestamp === 'function') {
    cb        = timestamp;
    timestamp = null;
  }

  timestamp = timestamp || Date.now();
  timestamp = Math.floor(timestamp / 1000);

  this._carbon.write(GraphiteClient.flatten(metrics), timestamp, cb);
};

GraphiteClient.prototype.close = function() {
  this._carbon.close();
};
