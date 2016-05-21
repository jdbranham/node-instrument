# node-instrument
Library to instrument your node application for graphite reporting


## Installation 
`npm install node-instrument`


## Usage
`var instrument = require('node-instrument')();`


## Options
	var options = {
		carbonHost : '127.0.0.1',
		carbonPort : 2003,
		type : 'udp4',
		prefix : '',
		suffix : '',
		verbose : false,
		interval : 5000,
		callback : null
	};
	
## Manual Reporting

    var instrument = require('node-instrument')({prefix: 'localhost'});
    instrument.addObject({myMetric: 1});
    instrument.send();
    
## Automated Interval Reporting

    var instrument = require('node-instrument')({prefix: 'localhost'});
    instrument.start();
    instrument.addObject({myMetric: 1});
    
## Put/Add
The 'put' and 'add' methods act slightly different.  
`put` and `putObject` - replaces the value of a metric if it already exists in the queue.  
`add` and `addObject` - adds to the value of a metric if it already exists in the queue.
    
## Name/Value metrics

    instrument.add('server.metric1', 1);
    
## Object/nested metrics

    instrument.addObject({myMetric: 1});
    // or
    instrument.addObject({myMetric: {sub: 1}});
    // or 
    instrument.addObject({myMetric: {sub: 1}, 
    								deep: {
    								   down: 1
    								   }
    								});
