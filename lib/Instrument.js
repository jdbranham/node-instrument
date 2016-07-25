'use strict';

// Some source from
// https://github.com/fermads/graphite-udp/blob/master/graphite-udp.js

/**
 * Module dependencies.
 */
var GraphiteClient = require('./GraphiteClient'), 
	util = require('util');

var defaults = {
		carbonHost : '127.0.0.1',
		carbonPort : 2003,
		type : 'udp4', // [udp4, tcp4]
		prefix : '',
		suffix : '',
		verbose : false,
		interval : 5000,
		localAddress: '0.0.0.0'
	};

module.exports = Instrument;
function Instrument(options) {
	this.options = util._extend(defaults, options);
	this._graphiteClient = this.options.graphiteClient;
	this.queue = {};
	this.id = false;
	if (this._graphiteClient) {
		this.log('using injected graphiteClient');
	} else {
		this.log('creating new graphiteClient');
		this._graphiteClient = GraphiteClient.createClient(this.options);
	}
};

Instrument.prototype.getQueue = function(){
	return this.queue;
};

Instrument.prototype.clearQueue = function(){
	this.queue = {};
};

Instrument.prototype.setGraphiteClient = function(graphiteClient){
	this._graphiteClient = graphiteClient;
};

Instrument.prototype.setCallback = function(next){
	this.options.callback = next;
};

Instrument.createInstrument = function(options) {
	return new this(options);
};

Instrument.prototype.log = function(line) {
	if (this.options.verbose == true)
		console.log('[node-instrument]', line);
};

Instrument.prototype.start = function(){
	if(!this.id){
		this.id = setInterval(this.send.bind(this), this.options.interval);
	}
};

Instrument.prototype.stop = function(){
	clearInterval(this.id);
	this.id = false;
};

Instrument.prototype.close = function(){
	this._graphiteClient.close && this._graphiteClient.close();
};

Instrument.prototype.send = function() {
	if (Object.keys(this.getQueue()).length === 0)
		return; //log('Queue is empty. Nothing to send')
	var metrics = this.getQueue();
	this.log('Sending ' + Object.keys(this.getQueue()).length + ' metrics to '
			+ this.options.carbonHost + ':' + this.options.carbonPort);
	this._graphiteClient.write(metrics, function(err, bytes){
		if(err){
			this.log('ERROR: ' + err);
		}
		if(this.options.callback){
			this.log('executing callback');
			return this.options.callback(err, bytes);
		}
	}.bind(this));
	this.clearQueue();
};
Instrument.prototype.getQueueAsText = function () {
	var text = '';
	for ( var name in this.getQueue()) {
		text += name + ' ' + this.getQueue()[name].value + ' '
				+ this.getQueue()[name].timestamp + '\n';
	}
	return text;
};
Instrument.prototype.getValueByName = function (metricName) {
	var metricValue = this.getQueue()[metricName];
	this.log(metricName + ' value: ' + metricValue)
	return metricValue;
};
Instrument.prototype.getQueueSize = function () {
	return Object.keys(this.getQueue()).length;
};
Instrument.prototype.add = function(name, value, replace) {
	if (!name || isNaN(parseFloat(value)) || value === Infinity)
		return this.log('Skipping invalid name/value: ' + name + ' ' + value);

	if (this.options.prefix)
		name = this.options.prefix + '.' + name;

	if (this.options.suffix)
		name = name + '.' + this.options.suffix;

	if (this.getQueue()[name] === undefined || replace)
		this.getQueue()[name] = value;
	else
		this.getQueue()[name] += value;
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