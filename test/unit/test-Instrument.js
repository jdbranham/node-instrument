'use strict';

/**
 * Module dependencies.
 */
var common = require('../common'),
	sinon = require('sinon'),
	instrument = common.instrument,
	prefix = common.instrumentOptions.prefix,
	suffix = common.instrumentOptions.suffix;

var _graphiteClient = instrument._graphiteClient;
var mockGraphiteClient = {
	write: function(message, callback){
		log('MOCK graphite: ' + message);
	}
};

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
	    	instrument.setGraphiteClient(mockGraphiteClient);
	    	instrument.send();
	        callback();
	    },
	    tearDown: function (callback) {
	        // clean up
	    	instrument._graphiteClient = _graphiteClient;
	        callback();
	    },
	    '#default constructor': function(test) {
	    	var _instrument = require(common.dir.lib + '/Instrument').createInstrument();	    		
	    	test.ok(_instrument.options != null);
	        test.done();
	    },
	    '#constructor with options': function(test) {
        	test.equal(instrument.options.carbonHost, common.instrumentOptions.carbonHost);
	        test.equal(instrument.options.carbonPort, common.instrumentOptions.carbonPort);
	        test.equal(instrument.options.verbose, common.instrumentOptions.verbose);
	        test.equal(instrument.options.prefix, common.instrumentOptions.prefix);
	        test.equal(instrument.options.suffix, common.instrumentOptions.suffix);
	        test.equal(instrument.options.interval, common.instrumentOptions.interval);
	        test.equal(instrument.options.callback, common.instrumentOptions.callback);
	        test.done();
	    },
	    '#put': function(test) {
	    	test.equal(instrument.getQueueSize(), 0);
	        instrument.put('test.put', 1);
	        instrument.put('test.put', 1);
	        test.equal(instrument.getQueueSize(), 1);
	        test.equal(instrument.getValueByName(prefix +'.test.put.' + suffix), 1);
	        instrument.send();
	        test.equal(instrument.getQueueSize(), 0);
	        test.done();
	    },
	    '#putObject': function(test) {
	    	test.equal(instrument.getQueueSize(), 0);
	        instrument.putObject(metrics);
	        test.equal(instrument.getQueueSize(), 3);
	        instrument.send();
	        test.equal(instrument.getQueueSize(), 0);
	        test.done();
	    },
	    '#add': function(test) {
	    	test.equal(instrument.getQueueSize(), 0);
	        instrument.add('test.add', 1);
	        instrument.add('test.add', 1);
	        instrument.add('test.add', 1);
	        test.equal(instrument.getQueueSize(), 1);
	        test.equal(instrument.getValueByName(prefix +'.test.add.' + suffix), 3);
	        instrument.send();
	        test.equal(instrument.getQueueSize(), 0);
	        test.done();
	    },
	    '#addObject': function(test) {
	    	test.equal(instrument.getQueueSize(), 0);
	        instrument.addObject(metrics);
	        test.equal(instrument.getQueueSize(), 3);
	        instrument.send();
	        test.equal(instrument.getQueueSize(), 0);
	        test.done();
	    }
};
