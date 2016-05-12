module.exports = function(options, callback){
	var Instrument = require('./lib/Instrument');
	return Instrument.createInstrument(options)
};
