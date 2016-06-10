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
	
	it('should write some metrics');
	
});