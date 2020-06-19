const express = require('express'),
	app = express(),
	http = require('http'),
	server = http.createServer(app),
	bodyparser = require('body-parser'),
	ip = require('ip'),
	chalk = require('chalk'),

	mongoUtils = require('./tools/mongoUtils'),
	logger = require('./tools/logger');
	
require('dotenv').config();
const env = process.env;

app.set('view engine', 'ejs');
app.use('/public', express.static('public'));
app.use('/lib', express.static('node_modules'));
app.use(bodyparser.json({ limit: '50mb' }));
app.use(bodyparser.urlencoded({ limit: '50mb', extended: true, parameterLimit:50000 }));
app.use(function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	next();
});

app.post('/login', (req, res) => {
	let credential = {
		email: req.body.email,
		password: req.body.password
	};

	mongoUtils.login(credential, (err, status) => {
		if (err) {
			logger.error('Error occurred while logging in', credential.email, err);
			res.status(500).send('Apologies! Unexpected error occurred while logging in!');
		}
		else if (status === 1) {
			res.status(200).send('Yayy! Successfully logged in!');
		}
		else if (status === 0) {
			res.status(401).send('Oops! Password you\'ve entered is incorrect!');
		}
		else if (status === -1) {
			res.status(400).send('Uh-Uh! Account with this email doesn\'t exist!');
		}
		else {
			res.status(500).send('Apologies! Unexpected error occurred while creating account!');
		}
	});
});

app.post('/signup', (req, res) => {
	let userData = {
		name: req.body.name,
		email: req.body.email,
		password: req.body.password
	};

	mongoUtils.signup(userData, (err, status) => {
		if (err) {
			logger.error('Error occurred while creating account', err);
			res.status(500).send('Apologies! Unexpected error occured while creating account!');
		}
		else if (status === 1) {
			res.status(201).send('Yayy! Successfully created your account!');
		}
		else if (status === 0) {
			res.status(400).send('Oops! Account with same email already exists! Try logging in or use a different email.');
		}
		else {
			res.status(500).send('Apologies! Unexpected error occured while creating account!');
		}
	});
});

app.get('/dashboard', (req, res) => {
	res.render('index');
});

app.get('/', (req, res) => {
	res.render('index');
});

server.listen(env.PORT || 8080, () => {
	logger.clear();
	logger.log(true, 'Starting Server');
	logger.log(false, 'Server is running at', 
		chalk.blue('http://' + (env.IP || ip.address() || 'localhost') + ':' + (env.PORT || '8080')));
	
	mongoUtils.connect(() => {
	});
});