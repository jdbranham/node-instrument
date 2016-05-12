'use strict';

var reporter = require('nodeunit').reporters.default,
	path = require('path');

reporter.run([path.join(__dirname, 'unit'),
              path.join(__dirname, 'integration')]);