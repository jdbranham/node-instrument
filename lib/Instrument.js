'use strict';

// Some source from
// https://github.com/fermads/graphite-udp/blob/master/graphite-udp.js

/**
 * Module dependencies.
 */
var GraphiteClient = require('./GraphiteClient'), 
	util = require('util'),
	queue = {}, 
	id,
	graphiteClient;

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

var Instrument = function(options) {
	options = util._extend(defaults, options);
	this.options = options;
	var _self = this;
	this.sendCallback = function(err){
		if(options.callback){
			return callback(err);
		} else return;
	};
	this.log = function(line) {
		if (options.verbose)
			console.log('[node-instrument]', line);
	}
	this.start = function(){
		id = setInterval(_self.send, options.interval);
	};
	this.stop = function(){
		clearInterval(id);
	};
	this.send = function() {
		if (Object.keys(queue).length === 0)
			return; //log('Queue is empty. Nothing to send')
		var metrics = queue;
		_self.log('Sending ' + Object.keys(queue).length + ' metrics to '
				+ options.carbonHost + ':' + options.carbonPort);
		graphiteClient.write(metrics, function(err){
			if(err){
				log(err);
			} 
			return self.sendCallback(err);
		});
		queue = {};
	};
	this.getQueueAsText = function () {
		var text = '';
		for ( var name in queue) {
			text += name + ' ' + queue[name].value + ' '
					+ queue[name].timestamp + '\n';
		}
		return text;
	};
	this.add = function(name, value, replace) {
		if (!name || isNaN(parseFloat(value)) || value === Infinity)
			return _self.log('Skipping invalid name/value: ' + name + ' ' + value);

		if (options.prefix)
			name = options.prefix + '.' + name;

		if (options.suffix)
			name = name + '.' + options.suffix;

		if (queue[name] === undefined || replace)
			queue[name] = value;
		else
			queue[name] += value;
		_self.log('Adding metric to queue: ' + name + ' ' + value);
	};
	this.addObject = function(obj, replace){
		var flattenedObj = GraphiteClient.flatten(obj);
		for ( var key in flattenedObj) {
			_self.add(key, flattenedObj[key], replace);
		}
	};
	this.putObject = function(obj) {
		var flattenedObj = GraphiteClient.flatten(obj);
		for ( var key in flattenedObj) {
			_self.put(key, flattenedObj[key]);
		}
	};
	this.put = function(name, value) {
		_self.add(name, value, true);
	};
	this.createGraphiteClient = function() {
		graphiteClient = GraphiteClient.createClient({
			carbonHost: options.carbonHost,
			carbonPort: options.carbonPort,
			type: options.type
		});
	};
	this.init = function() {
		_self.createGraphiteClient();
		_self.start();

		var instrument = {
			add : _self.add,
			addObject: _self.addObject,
			put : _self.put,
			putObject: _self.putObject,
			options : _self.options,
			stop: _self.stop,
			start: _self.start
		};
		return instrument;
	};
	return this.init();
};
module.exports = function(options){
	return new Instrument(options);
};