'use strict';

var common       = require('../common');
var sinon        = require('sinon');
var CarbonClient = common.carbonClient;
var GraphiteClient = common.graphite;

var carbon;

module.exports = {
	    setUp: function (callback) {
	    	carbon = sinon.stub({
				write : function() {
				},
			});
	        callback();
	    },
	    tearDown: function (callback) {
	        // clean up
	        callback();
	    },
	    'closes socket if it has one': function(test) {
	        var socket = sinon.stub({close: function() {}});
	        var client = new CarbonClient({socket: socket});
	        client.close();
	        test.done();
	    },
		'does not crash if it has no socket': function(test) {
			var client = new CarbonClient();
			client.close();
			test.done();
		}
};
