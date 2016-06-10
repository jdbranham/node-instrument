'use strict';

/**
 * Module dependencies.
 */
var common = require('../common'),
	sinon = require('sinon'),
	instrument,
	prefix = common.instrumentOptions.prefix,
	suffix = common.instrumentOptions.suffix;

//var _graphiteClient = instrument._graphiteClient;
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

describe('Instrument', function(){
	beforeEach(function(done){
    	instrument = common.instrument();
    	instrument.setGraphiteClient(mockGraphiteClient);
    	instrument.send();
        done();
	});
	
	afterEach(function(done){
    	instrument.close();
    	instrument = null;
        done();
	});
	
	it('should create an instrument using the default constructor',function(done){
    	var _instrument = require(common.dir.lib + '/Instrument').createInstrument();	    		
    	_instrument.options.should.not.be.null();
        return done();
	});
	
	it('should create an instrument with options',function(done){
		instrument.options.carbonHost.should.be.exactly(common.instrumentOptions.carbonHost);
        instrument.options.carbonPort.should.be.exactly(common.instrumentOptions.carbonPort);
        instrument.options.verbose.should.be.exactly(common.instrumentOptions.verbose);
        instrument.options.prefix.should.be.exactly(common.instrumentOptions.prefix);
        instrument.options.suffix.should.be.exactly(common.instrumentOptions.suffix);
        instrument.options.interval.should.be.exactly(common.instrumentOptions.interval);
        instrument.options.callback.should.be.exactly(common.instrumentOptions.callback);
        return done();
	});
	
	it('should put',function(done){
		instrument.getQueueSize().should.be.exactly(0);
        instrument.put('test.put', 1);
        instrument.put('test.put', 1);
        instrument.getQueueSize().should.be.exactly(1);
        instrument.getValueByName(prefix +'.test.put.' + suffix).should.be.exactly(1);
        instrument.send();
        instrument.getQueueSize().should.be.exactly(0);
        return done();
	});
	
	it('should put object',function(done){
		instrument.getQueueSize().should.be.exactly(0);
        instrument.putObject(metrics);
        instrument.getQueueSize().should.be.exactly(3);
        instrument.send();
        instrument.getQueueSize().should.be.exactly(0);
        return done();
	});
	
	it('should add',function(done){
    	instrument.getQueueSize().should.be.exactly(0);
        instrument.add('test.add', 1);
        instrument.add('test.add', 1);
        instrument.add('test.add', 1);
        instrument.getQueueSize().should.be.exactly(1);
        instrument.getValueByName(prefix +'.test.add.' + suffix).should.be.exactly(3);
        instrument.send();
        instrument.getQueueSize().should.be.exactly(0);
        return done();
	});
	
	it('should add object',function(done){
    	instrument.getQueueSize().should.be.exactly(0);
        instrument.addObject(metrics);
        instrument.getQueueSize().should.be.exactly(3);
        instrument.send();
        instrument.getQueueSize().should.be.exactly(0);
        return done();
	});
});
