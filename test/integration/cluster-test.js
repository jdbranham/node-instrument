var cluster = require('cluster'),
	run = require('../run'),
	util = require('util'),
	numCPUs = require('os').cpus().length;

var log = function(msg){
	if(process.env.NI_VERBOSE)
		console.log('[cluster-test ' + process.pid + '] ' + msg);
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

describe('Clustering test', function(){
	
	it('should be able to send from different child processes at the same time', function(done){
		
		if(cluster.isWorker) {
			log('running as worker.');
			var worker = cluster.worker;
		    var instrument = require('../../index')({
		    	type: 'udp4',
		    	interval: 1,
		    	callback: function(){
		    		log('process exiting in instrument callback: ' + worker.process.pid);
		    		worker.process.send('done');
		    		worker.process.exit(0);
		    	}.bind(this)
		    });
		    instrument.addObject(metrics);
		    instrument.start();
			
		} else {
		    var numWorkers = 2; //numCPUs;
		    var responses = 0;
		    
		    log('Master cluster setting up ' + numWorkers + ' workers...');
		    
		    for(var i = 0; i < numWorkers; i++) {
		        cluster.fork();
		    }
		    
			var messageHandler = function(msg) {
				if (msg == 'done') {
					responses += 1;
				}
		        if(responses == numWorkers) {
		        	cluster.disconnect();
		        	done();
		        }
			};
		    
		    Object.keys(cluster.workers).forEach(function(id) {
		        cluster.workers[id].on('message', messageHandler);
		      });

		    cluster.on('online', function(worker) {
		        log('Worker ' + worker.process.pid + ' is online');
		    });

		    cluster.on('exit', function(worker, code, signal) {
		        log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
		    });
		    
			cluster.on('message', function(message) {
				log('received message: ' + util.inspect(message));
			});

		}
		
	});
});

