'use strict';

// Some source from
// https://github.com/fermads/graphite-udp/blob/master/graphite-udp.js

/**
 * Module dependencies.
 */
var GraphiteClient = require('./GraphiteClient'), 
	util = require('util'),
	queue = {}, 
	id = false,
	_self;

var defaults = {
		carbonHost : '127.0.0.1',
		carbonPort : 2003,
		type : 'udp4', // [udp4, tcp4]
		prefix : '',
		suffix : '',
		verbose : false,
		interval : 5000,
		callback : null,
		localIp: '0.0.0.0'
	};

module.exports = Instrument;
function Instrument(options) {
	this.options = util._extend(defaults, options);
	this._graphiteClient = this.options.graphiteClient;
	if (this._graphiteClient) {
		this.log('using injected graphiteClient');
	} else {
		this.log('creating new graphiteClient');
		this._graphiteClient = GraphiteClient.createClient(this.options);
	}
};

Instrument.prototype.setGraphiteClient = function(graphiteClient){
	this._graphiteClient = graphiteClient;
};

Instrument.prototype.setCallback = function(next){
	this.options.callback = next;
};

Instrument.createInstrument = function(options) {
	_self = new this(options);
	return _self;
};
	
Instrument.prototype.sendCallback = function(err){
	if(this.options.callback){
		return this.options.callback(err);
	} else return;
};

Instrument.prototype.log = function(line) {
	if (this.options.verbose)
		console.log('[node-instrument]', line);
};

Instrument.prototype.start = function(){
	if(!id){
		id = setInterval(this.send, this.options.interval);
	}
};

Instrument.prototype.stop = function(){
	clearInterval(id);
	id = false;
};

Instrument.prototype.close = function(){
	_self._graphiteClient.close && _self._graphiteClient.close();
};

Instrument.prototype.send = function() {
	if (Object.keys(queue).length === 0)
		return; //log('Queue is empty. Nothing to send')
	var metrics = queue;
	_self.log('Sending ' + Object.keys(queue).length + ' metrics to '
			+ _self.options.carbonHost + ':' + _self.options.carbonPort);
	_self._graphiteClient.write(metrics, function(err){
		if(err){
			_self.log('ERROR: ' + err);
		}
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
Instrument.prototype.getValueByName = function (metricName) {
	var metricValue = queue[metricName];
	this.log(metricName + ' value: ' + metricValue)
	return metricValue;
};
Instrument.prototype.getQueueSize = function () {
	return Object.keys(queue).length;
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