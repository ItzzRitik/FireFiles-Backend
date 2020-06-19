require('dotenv').config();
let passport, loading, mongoCall = 0;
const mongoose = require('mongoose'),
	LocalStrategy = require('passport-local').Strategy,
	chalk = require('chalk'),

	logger = require('./logger'),
	User = require('../models/user');

const login = (credential, cb) => {
		User.findOne({ email: credential.email }, function(err, user) {
			if (err) return cb(err);

			// User doesn't exist
			if (!user) return cb(null, -1);

			// User found
			user.comparePassword(credential.password, (err, isMatch) => {
				if (err) return cb(err);
				
				return cb(null, +isMatch);
			});
		});
	},

	signup = (userData, cb) => {
		User.register(new User({ username: req.body.username }), req.body.password, function(err, user){
			if(err){
				console.log(err);
				return res.render('register');
			}
			passport.authenticate('local')(req, res, function(){
			   res.redirect('/secret');
			});
		});

		// User.find({ email: userData.email }, function(err, users) {
		// 	if (err) return cb(err);

		// 	// User already exists
		// 	if (users.length) {
		// 		return cb(null, 0);
		// 	}
			
		// 	// Creating account
		// 	User.create({
		// 		name: userData.name,
		// 		email: userData.email,
		// 		password: userData.password
		// 	}, function(err) {
		// 		if (err) return cb(err);

		// 		return cb(null, 1);
		// 	});
		// });
	},

	consoleLoader = (msg) => {
		let x = 0, 
			load = ['⠁ ', '⠈ ', ' ⠁', ' ⠈', ' ⠐', ' ⠠', ' ⢀', ' ⡀', '⢀ ', '⡀ ', '⠄ ', '⠂ '];
		return setInterval(() => {
			logger.stdout('\r' + load[x = (++x < load.length) ? x : 0] + ' ' + msg);
		}, 50);
	},

	dbOptions = { useNewUrlParser: true, useFindAndModify: false, useUnifiedTopology: true, useCreateIndex: true, poolSize: 10 },
	mongoConnect = (cb) => {
		loading = consoleLoader(' '.repeat(34));
		mongoose.connect(process.env.MONGO_KEY, dbOptions).then(
			() => {
				clearInterval(loading);
				logger.stdout('\r');
				logger.log(false, 'Connection Established');
				cb();
			}
		).catch((e) => {
			clearInterval(loading);
			++mongoCall > 1 && logger.stdout('\033[A\33[2K\r');

			logger.stdout('\r');
			logger.error(false, 'Connection Failed: ', chalk.red(e), chalk.red.dim((mongoCall > 1) ? '(' + mongoCall + ')' : ''));
			loading = consoleLoader('  Reconnecting');
			setTimeout(mongoConnect, 10000);
		});
	},
    
	connectMongoDB = (cb) => {
		logger.log(true, 'Connecting to MongoDB Atlas Server');
		mongoConnect(() => {
			cb();
		});
	},

	initPassport = (passport) => {
		this.passport = passport;
		passport.use(new LocalStrategy(User.authenticate()));
		passport.serializeUser(User.serializeUser());
		passport.deserializeUser(User.deserializeUser());
	};

module.exports = { initPassport, connectMongoDB, consoleLoader, User, login, signup };