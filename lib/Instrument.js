'use strict';

// Some source from
// https://github.com/fermads/graphite-udp/blob/master/graphite-udp.js

/**
 * Module dependencies.
 */
var GraphiteClient = require('./GraphiteClient'), 
	util = require('util'),
	queue = {}, 
	id;

var defaults = {
		carbonHost : '127.0.0.1',
		carbonPort : 2003,
		type : 'udp4',
		prefix : '',
		suffix : '',
		verbose : false,
		interval : 5000,
		callback : null
	};

module.exports = Instrument;
function Instrument(options) {
	this._self = this;
	this.options = util._extend(defaults, options);
	this._graphiteClient = this.options.graphiteClient;
	if (this._graphiteClient) {
		this.log('using injected graphiteClient');
	} else {
		this.log('creating new graphiteClient');
		this._graphiteClient = GraphiteClient.createClient({
			carbonHost : this.options.carbonHost,
			carbonPort : this.options.carbonPort,
			type : this.options.type
		});
	}
}

Instrument.createInstrument = function(options) {
	var instrument = new this(options);
	return instrument;
};
	
Instrument.prototype.sendCallback = function(err){
	if(this.options.callback){
		return this.callback(err);
	} else return;
};

Instrument.prototype.log = function(line) {
	if (this.options.verbose)
		console.log('[node-instrument]', line);
};

Instrument.prototype.start = function(){
	id = setInterval(this.send, this.options.interval);
};
Instrument.prototype.stop = function(){
	clearInterval(id);
};
Instrument.prototype.send = function() {
	var _self = this;
	if (Object.keys(queue).length === 0)
		return; //log('Queue is empty. Nothing to send')
	var metrics = queue;
	_self.log('Sending ' + Object.keys(queue).length + ' metrics to '
			+ _self.options.carbonHost + ':' + _self.options.carbonPort);
	_self._graphiteClient.write(metrics, function(err){
		if(err){
			_self.log('ERROR: ' + err);
		} 
		_self._graphiteClient.end();
		return _self.sendCallback(err);
	});
	queue = {};
};
Instrument.prototype.getQueueAsText = function () {
	var text = '';
	for ( var name in queue) {
		text += name + ' ' + queue[name].value + ' '
				+ queue[name].timestamp + '\n';
	}
	return text;
};
Instrument.prototype.add = function(name, value, replace) {
	if (!name || isNaN(parseFloat(value)) || value === Infinity)
		return this.log('Skipping invalid name/value: ' + name + ' ' + value);

	if (this.options.prefix)
		name = this.options.prefix + '.' + name;

	if (this.options.suffix)
		name = name + '.' + this.options.suffix;

	if (queue[name] === undefined || replace)
		queue[name] = value;
	else
		queue[name] += value;
	this.log('Adding metric to queue: ' + name + ' ' + value);
};
Instrument.prototype.addObject = function(obj, replace){
	var flattenedObj = GraphiteClient.flatten(obj);
	for ( var key in flattenedObj) {
		this.add(key, flattenedObj[key], replace);
	}
};
Instrument.prototype.putObject = function(obj) {
	var flattenedObj = GraphiteClient.flatten(obj);
	for ( var key in flattenedObj) {
		this.put(key, flattenedObj[key]);
	}
};
Instrument.prototype.put = function(name, value) {
	this.add(name, value, true);
};