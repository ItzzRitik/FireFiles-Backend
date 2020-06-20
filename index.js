const express = require('express'),
	app = express(),
	session = require('express-session'),
	mongoStore = require('connect-mongo')(session),
	http = require('http'),
	server = http.createServer(app),
	bodyparser = require('body-parser'),
	ip = require('ip'),
	chalk = require('chalk'),
	passport = require('passport'),

	dbUtils = require('./tools/dbUtils'),
	logger = require('./tools/logger');
	
require('dotenv').config();
const env = process.env;

app.set('view engine', 'ejs');

app.use('/public', express.static('public'));
app.use('/lib', express.static('node_modules'));
app.use(bodyparser.json({ limit: '50mb' }));
app.use(bodyparser.urlencoded({ limit: '50mb', extended: true, parameterLimit:50000 }));

app.use(session({
	secret: env.SESSION_KEY,
	resave: false,
	saveUninitialized: false,
	store: new mongoStore ({
		mongooseConnection: dbUtils.mongoose.connection
	})
}));
app.use(passport.initialize());
app.use(passport.session());

dbUtils.initPassport(passport);

function isAuthenticated (req, res, next) {
	if (req.isAuthenticated()) return next();

	return res.redirect('/login');
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
				return res.status(400).send(info.message);
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

app.get('/dashboard', isAuthenticated, (req, res) => {
	res.render('dashboard');
});

app.get('/login', (req, res) => {
	if (req.isAuthenticated()) {
		return res.redirect('/dashboard');
	}

	return res.render('index');
});

app.get('/logout', (req, res) => {
	req.logout();
	req.session.destroy(function() {
		res.clearCookie('connect.sid');
		res.redirect('/');
	});
});

app.get('/', isAuthenticated, (req, res) => {
	return res.redirect('/login');
});

server.listen(env.PORT || 8080, () => {
	logger.clear();
	logger.log(true, 'Starting Server');
	logger.log(false, 'Server is running at', 
		chalk.blue('http://' + (env.IP || ip.address() || 'localhost') + ':' + (env.PORT || '8080')));
	
	dbUtils.connectMongoDB(() => {
	});
});