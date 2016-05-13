var common         = require('../common');
var sinon          = require('sinon');
var graphite       = common.graphite;
var GraphiteClient = graphite;

var client;
var carbon;

module.exports = {
	    setUp: function (callback) {
	    	carbon = sinon.stub({
				write : function() {
				},
			});
			client = new GraphiteClient({
				carbon : carbon
			});
	        callback();
	    },
	    tearDown: function (callback) {
	        // clean up
	        callback();
	    },
	    '#default constructor': function (test) {
	    	var client = graphite.createClient();
	        test.ok(client instanceof GraphiteClient);
	        test.done();
	    },
	    '#takes carbon properties': function (test) {
	    	var client = graphite.createClient({
	    		type: 'udp4',
	    		carbonPort: 2003,
	    		carbonHost: '127.0.0.1'
	    	});
	        test.ok(client instanceof GraphiteClient);
	        test.done();
	    },
	    '#returns an already flat object as is':function(test){
	    	var obj = {foo: 'bar'};
	        test.deepEqual(graphite.flatten(obj), {foo: 'bar'});
	        test.done();
	    },
	    '#returns a copy of the object':function(test){
	    	var obj  = {foo: 'bar'};
	        var flat = graphite.flatten(obj);
	        test.notStrictEqual(obj, flat);
	        test.done();
	    },
	    '#flattens a deep object' : function(test) {
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
	
			test.deepEqual(flat, {
				'a' : 1,
				'deep.we.go.b' : 2,
				'deep.we.go.c' : 3,
				'd' : 4,
			});
	        test.done();
		},
		'#write flattens metrics before passing to carbon' : function(test) {
			var metrics = {
				foo : {
					bar : 1
				}
			};
			client.write(metrics);

			test.ok(carbon.write.calledWith({
				'foo.bar' : 1
			}));
	        test.done();
		},

		'#write passes the current time to carbon' : function(test) {
			client.write({});

			var now = Math.floor(Date.now() / 1000);
			test.ok(carbon.write.getCall(0).args[1] >= now);
	        test.done();
		},

		'#write lets you pass a timestamp to carbon' : function(test) {
			client.write({}, 23000);
			test.equal(carbon.write.getCall(0).args[1], 23);
	        test.done();
		},

		'#write passes a callback to carbon' : function(test) {
			var cb = function() {
			};
			client.write({}, null, cb);
			test.equal(carbon.write.getCall(0).args[2], cb);
	        test.done();
		},

		'#write takes callback as second argument as well' : function(test) {
			var cb = function() {
			};
			client.write({}, cb);
			test.equal(carbon.write.getCall(0).args[2], cb);
	        test.done();
		},
	};

