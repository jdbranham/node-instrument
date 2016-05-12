'use strict';

/**
 * Module dependencies.
 */
var common = require('../common'),
	sinon        = require('sinon');

module.exports = {
	    setUp: function (callback) {
	        callback();
	    },
	    tearDown: function (callback) {
	        // clean up
	        callback();
	    },
	    '#default constructor': function(test) {
	    	var instrument = common.instrument();	    		
	    	test.ok(instrument.options != null);
	        instrument.stop();
	        test.done();
	    },
	    '#constructor with options': function(test) {
	    	var graphiteHost = '0.0.0.0',
	    		port = 123,
	    		verbose = true,
	    		prefix = 'test',
	    		suffix = 'end',
	    		interval = 10000,
	    		callback = function(){};
	    		
	    		var instrument = common.instrument({
		        	graphiteHost: graphiteHost,
		        	port: port,
		        	verbose: verbose,
		        	prefix: prefix,
		        	suffix: suffix,
		        	interval: interval,
		        	callback: callback
		        });
	        	test.equal(instrument.options.graphiteHost, graphiteHost);
		        test.equal(instrument.options.port, port);
		        test.equal(instrument.options.verbose, verbose);
		        test.equal(instrument.options.prefix, prefix);
		        test.equal(instrument.options.suffix, suffix);
		        test.equal(instrument.options.interval, interval);
		        test.equal(instrument.options.callback, callback);
		        instrument.stop();
		        test.done();
	    }
};
