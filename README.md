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


## Methods

### add: function()
Add metric name/values together

    instrument.add('server.metric1', 1); // 'server.metric1' == 1
	instrument.add('server.metric1', 1); // 'server.metric1' == 2
	instrument.add('server.metric1', 1); // 'server.metric1' == 3
	

### addObject: function()
Add metric object/values together

	instrument.addObject({myMetric: {sub: 1}}); // 'myMetric.sub' == 1
	instrument.addObject({myMetric: {sub: 1}}); // 'myMetric.sub' == 2
	instrument.addObject({myMetric: {sub: 1}}); // 'myMetric.sub' == 3

### getQueueAsText: function()
Returns a text readout of the current queue

### getQueueSize: function()
Returns the number of metrics waiting in queue

### getValueByName: function()
Returns the current value of a metric in the queue

	instrument.getValueByName('myMetric.sub'); // number

### log: function()
Internal logging function

### put: function()
Inserts or replaces the value of a metric in queue

### putObject: function()
Inserts or replaces each flattened metric in a queue

### send: function()
Manually flush the node-instrument queue and send to Graphite

	instrument.send(); // Flushes the internal queue to the Graphite instance

### sendCallback: function()
Internal function to execute the options.callback

### setGraphiteClient: function()
Convenience method for setting the Graphite Client after node-instrument has been initialized 

### start: function()
Start the interval reporting of node-instrument

### stop: function()
Stops the interval reporting of node-instrument