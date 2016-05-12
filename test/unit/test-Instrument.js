'use strict';

/**
 * Module dependencies.
 */
var common = require('../common'),
	sinon = require('sinon'),
	GraphiteClient = common.graphite;

var stubbedGraphiteClient = sinon.createStubInstance(GraphiteClient);

var instrumentOptions = {
		carbonHost: '127.0.0.1',
		carbonPort: 123,
    	verbose: true,
    	prefix: 'prefix',
    	suffix: 'suffix',
    	interval: 3000,
    	callback: function(msg){
    		log(msg);
    	},
    	graphiteClient: stubbedGraphiteClient
    }


var metrics = {
		foo : 1,
		deep : {
			down : {
				a : 2,
				b : 3,
			}
		}
	};

var log = function(message){
	console.log('[TEST-INSTRUMENT] ' + message);
}

module.exports = {
	    setUp: function (callback) {
	        callback();
	    },
	    tearDown: function (callback) {
	        // clean up
	        callback();
	    },
	    '#default constructor': function(test) {
	    	var instrument = require(common.dir.root)();	    		
	    	test.ok(instrument.options != null);
	        instrument.stop();
	        test.done();
	    },
	    '#constructor with options': function(test) {
    		var instrument = common.instrument(instrumentOptions);
        	test.equal(instrument.options.carbonHost, instrumentOptions.carbonHost);
	        test.equal(instrument.options.carbonPort, instrumentOptions.carbonPort);
	        test.equal(instrument.options.verbose, instrumentOptions.verbose);
	        test.equal(instrument.options.prefix, instrumentOptions.prefix);
	        test.equal(instrument.options.suffix, instrumentOptions.suffix);
	        test.equal(instrument.options.interval, instrumentOptions.interval);
	        test.equal(instrument.options.callback, instrumentOptions.callback);
	        instrument.stop();
	        test.done();
	    },
	    '#put': function(test) {
	    	var instrument = require(common.dir.root)(instrumentOptions);
	    	log(instrument.graphiteClient);
	        instrument.put('test', 1);
	        instrument.stop();
	        instrument.send();
	        test.done();
	    },
	    '#putObject': function(test) {
	    	var instrument = require(common.dir.root)(instrumentOptions);
	        instrument.putObject(metrics);
	        instrument.stop();
	        instrument.send();
	        test.done();
	    },
	    '#add': function(test) {
	    	var instrument = require(common.dir.root)(instrumentOptions);
	        instrument.add('test', 1);
	        instrument.stop();
	        instrument.send();
	        test.done();
	    },
	    '#addObject': function(test) {
	    	var instrument = require(common.dir.root)(instrumentOptions);
	        instrument.addObject(metrics);
	        instrument.stop();
	        instrument.send();
	        test.done();
	    }
};
