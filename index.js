const express = require('express'),
	app = express(),
	session = require('cookie-session'),
	http = require('http'),
	server = http.createServer(app),
	bodyparser = require('body-parser'),
	ip = require('ip'),
	chalk = require('chalk'),
	passport = require('passport'),
	_ = require('lodash'),

	awsUtils = require('./tools/awsUtils'),
	dbUtils = require('./tools/dbUtils'),
	logger = require('./tools/logger');
	
require('dotenv').config();
const env = process.env;

app.set('view engine', 'ejs');

app.use('/public', express.static('public'));
app.use('/lib', express.static('node_modules'));
app.use(bodyparser.json({ limit: '50mb' }));
app.use(bodyparser.urlencoded({ limit: '50mb', extended: true, parameterLimit:50000 }));

// Cors configuration
app.use(function(req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', env.APP_URL);
	res.setHeader('Access-Control-Allow-Credentials', true);
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
	next();
});

app.use(session({
	secret: env.SESSION_KEY,
	resave: false,
	saveUninitialized: false,
	cookie: {
		secureProxy: true
	}
}));
app.use(passport.initialize());
app.use(passport.session());

dbUtils.initPassport(passport);

function isAuthenticated (req, res, next) {
	if (req.isAuthenticated()) return next();

	if (req.method == 'GET') {
		return res.redirect('/#login');
	}
	else if (req.method == 'POST') {
		return res.status(403).send({
			message: 'Authentication is required to access this route'
		});
	}
}

app.post('/login', (req, res) => {
	passport.authenticate('local', function (err, user, info) {   
		if (user) {
			req.login(user, (err) => {
				if (err) return res.status(500).send('Apologies! Unexpected error occurred while creating account!');
				return res.status(200).redirect('/dashboard');
			});
		}
		else if (err) {
			logger.error('Unexpected error occurred while creating account', err);
			return res.status(500).send('Apologies! Unexpected error occurred while creating account!');
		}
		else if (info) {
			// User not found
			if (info.name === 'IncorrectUsernameError') {
				return res.status(404).send(info.message);
			}
			// Incorrect password
			else if (info.name === 'IncorrectPasswordError') {
				return res.status(403).send(info.message);
			}
		}
	})(req, res);
});

app.post('/signup', (req, res) => {
	let userData = {
		name: req.body.name,
		email: req.body.email,
		password: req.body.password
	};

	dbUtils.signup(userData, (err) => {
		if (err) {
			// User already exists
			if (err.name === 'UserExistsError') {
				return res.status(400).send(err.message);
			}
			// Missing email address
			else if (err.name === 'MissingUsernameError') {
				return res.status(422).send(err.message);
			}
			// Missing password
			else if (err.name === 'MissingPasswordError') {
				return res.status(422).send(err.message);
			}
			// Invalid email address
			else if (err.name === 'ValidationError') {
				return res.status(422).send(err.message);
			}
			// Invalid password
			else if (err.name === 'InvalidPasswordError') {
				return res.status(422).send(err.message);
			}

			logger.error('Unexpected error occurred while creating account', err);
			return res.status(500).send('Apologies! Unexpected error occurred while creating account!');
		}
		
		return res.status(201).send('Yayy! Successfully created your account!');
	});
});

app.post('/getUser', function(req, res) {
	if (req.user === undefined) {
		return res.status(204).json({});
	} 
	return res.status(200).json(_.pick(req.user, ['id', 'email', 'name']));
});

app.post('/getSignedS3', isAuthenticated, (req, res) => {
	let file = {
		name: req.body.fileName,
		type: req.body.fileType
	};
	
	awsUtils.getSignedS3(file, req.user, (err, preSignedPost) => {
		if (err) {
			logger.error('Error occurred while generating aws s3 preSignedPost', err);
			return res.status(503);
		}

		return res.status(200).send(preSignedPost);
	});
});

app.get('/download/:fileKey', isAuthenticated, (req, res) => {
	let fileKey = req.user.id + '/' + req.params.fileKey;
	awsUtils.streamFile(fileKey, (headers, readStream) => {
		res.set('Content-Length', headers['content-length']);
		res.set('Content-Type', headers['content-type']);
		readStream.pipe(res);
	});
});

app.get('/dashboard', isAuthenticated, (req, res) => {
	res.render('dashboard');
});

app.get('/login', (req, res) => {
	if (req.isAuthenticated()) {
		return res.redirect('/dashboard');
	}
	res.redirect('/#login');
});

app.get('/logout', (req, res) => {
	req.logout();
	req.session.destroy(function() {
		res.clearCookie('connect.sid');
		res.redirect('/');
	});
});

app.get('/', (req, res) => {
	return res.render('homepage');
});

app.get('/*', (req, res) => {
	return res.send('404 Page Not Found');
});

server.listen(env.PORT || 8080, () => {
	logger.clear();
	logger.log(true, 'Starting Server');
	logger.log(false, 'Server is running at', 
		chalk.blue('http://' + (env.IP || ip.address() || 'localhost') + ':' + (env.PORT || '8080')));
	
	dbUtils.connectMongoDB(() => {
	});
});