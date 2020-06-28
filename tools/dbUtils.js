require('dotenv').config();
let loading, mongoCall = 0;
const mongoose = require('mongoose'),
	chalk = require('chalk'),

	logger = require('./logger'),
	User = require('../models/user');

const signup = (userData, cb) => {
		User.register(new User({ 
			name: userData.name,
			email: userData.email 
		}), userData.password, (err) => {
			if (err) return cb(err);

			return cb();
		});
	},
	getUserData = (email, fields, cb) => {
		User.findOne({ email }, fields, (err, userData) => {
			if (err) return cb(err);

			const user = userData.toObject();
			delete user._id;

			if (fields.picture !== 0 && !user.picture) {
				const spaces = user.name.trim().split(' ').length - 1;
				user.picture = 'https://avatars.dicebear.com/api/initials/' + encodeURIComponent(user.name.trim()) +
					'.svg?r=50&m=8&chars=' + (spaces == 0 ? '1' : '2') + '&backgroundColorLevel=300';
			}

			return cb(null, userData._id, user);
		});
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
				logger.log(false, chalk.green('MongoDB Connection Established'));
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
		mongoConnect(() => {
			cb();
		});
	},

	initPassport = (passport) => {
		passport.use(User.createStrategy());
		passport.serializeUser(User.serializeUser());
		passport.deserializeUser(User.deserializeUser());
	};

module.exports = { initPassport, connectMongoDB, mongoose, consoleLoader, User, signup, getUserData };