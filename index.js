const express = require('express'),
    app = express(),
    http = require('http'),
    server = http.createServer(app),
    bodyparser = require('body-parser'),
    mongoose = require('mongoose'),
    ip = require('ip'),
	chalk = require('chalk'),

	mongoUtils = require('./tools/mongoUtils'),
    logger = require('./tools/logger'),
	crypto = require('./tools/crypto');
	
require('dotenv').config();
const env = process.env;



server.listen(env.PORT || 8080, function() {
	logger.clear();
	logger.log(true, 'Starting Server');
	logger.log(false, 'Server is running at', 
		chalk.blue('http://' + (env.IP || ip.address() || 'localhost') + ':' + (env.PORT || '8080')));
	
	mongoUtils.connect(() => {
	});
});