'use strict';

var common       = require('../common');
var sinon        = require('sinon');
var CarbonClient = common.carbonClient;
var GraphiteClient = common.graphite;

var carbon;

describe('Carbon', function(){
	beforeEach(function(done){
		carbon = sinon.stub({
			write : function() {
			},
		});
        done();
	});
	
	it('should closes socket if it has on', function(done){
		var socket = sinon.stub({close: function() {}});
        var client = new CarbonClient({socket: socket});
        client.close();
        return done();
	});
	
	it('should not crash if it has no socket', function(done){
		var client = new CarbonClient();
		client.close();
		return done();
	});
});