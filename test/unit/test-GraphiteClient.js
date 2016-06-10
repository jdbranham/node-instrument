var common         = require('../common');
var sinon          = require('sinon');
var graphite       = common.graphite;
var GraphiteClient = graphite;

var client;
var carbon;

describe('GraphiteClient', function(){
	beforeEach(function(done){
		carbon = sinon.stub({
				write : function() {
				},
			});
		client = new GraphiteClient({
			carbon : carbon
		});
		done();
	});
	
	it('should create a client with the empty constructor', function(done){
		var client = graphite.createClient();
        client.should.be.an.instanceof(GraphiteClient);
        return done();
	});
	
	it('should create a client with the provided carbon properties', function(done){
		var client = graphite.createClient({
    		type: 'udp4',
    		carbonPort: 2003,
    		carbonHost: '127.0.0.1'
    	});
        client.should.be.an.instanceof(GraphiteClient);
        return done();
	});
	
	it('should return an already flattened object "as-is"', function(done){
		var obj = {foo: 'bar'};
        graphite.flatten(obj).should.deepEqual({foo: 'bar'});
        return done();
	});
	
	it('should return a copy of the object', function(done){
    	var obj  = {foo: 'bar'};
        var flat = graphite.flatten(obj);
        obj.should.deepEqual(flat);
        return done();
	});
	
	it('should flatten a deep object', function(done){
		var obj = {
				a : 1,
				deep : {
					we : {
						go : {
							b : 2,
							c : 3,
						}
					}
				},
				d : 4,
			};
			var flat = graphite.flatten(obj);
	
			flat.should.deepEqual({
				'a' : 1,
				'deep.we.go.b' : 2,
				'deep.we.go.c' : 3,
				'd' : 4,
			});
	        return done();
	});
	
	it('should flatten metrics before passing to carbon', function(done){
		var metrics = {
				foo : {
					bar : 1
				}
			};
			client.write(metrics);

			carbon.write.calledWith({
				'foo.bar' : 1
			}).should.be.true();
			
	        return done();
	});
	
	it('should pass the current time to carbon', function(done){
		client.write({});

		var now = Math.floor(Date.now() / 1000);
		(carbon.write.getCall(0).args[1] >= now).should.be.true();
        return done();
	});
	
	it('should let you pass a timestamp to carbon', function(done){
		client.write({}, 23000);
		carbon.write.getCall(0).args[1].should.be.exactly(23);
        return done();
	});
	
	it('should pass a callback to carbon', function(done){
		var cb = function() {
		};
		client.write({}, null, cb);
		carbon.write.getCall(0).args[2].should.equal(cb);
        return done();
	});
	
	it('should take callback as second argument as well', function(done){
		var cb = function() {
		};
		client.write({}, cb);
		carbon.write.getCall(0).args[2].should.equal(cb);
        return done();
	});
		
});