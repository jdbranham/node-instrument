module.exports = function(options){
	var Instrument = require('./lib/Instrument');
	return Instrument.createInstrument(options);
};
