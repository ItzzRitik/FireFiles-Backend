require('dotenv').config();
const logger = require('./logger'),
	chalk = require('chalk'),
	dbUtils = require('./dbUtils'),
	awsUtils = require('./awsUtils'),

	initialize = (io, cookieSession) => {
		logger.log(false, chalk.green('SocketIO Service Established'));
		io.use((socket, next) => {
			cookieSession(socket.request, socket.request.res, () => {
				if (!socket.request.session.passport) return next(new Error('forbidden'));
				next();
			});
		});

		io.on('connection', (socket) => {
			var email = socket.request.session.passport.user,
				userID = null,
				userData = null;
			dbUtils.getUserData(email, '', (err, id, user) => {
				userID = id;
				userData = user;
				awsUtils.listFiles(id, (err, files) => {
					socket.join(id);
					socket.emit('userData', userData);
				});
			});

			socket.on('getSignedS3', (files, cb) => {
				const processFiles = async (items) => {
					for (let item of items) {
						item.signedS3 = await awsUtils.getSignedS3(item, userID);
					}
					return items;
				}
				processFiles(files).then(res => {
						cb(null, res);
					})
					.catch(err => {
						cb(err);
					});
			});
        
			socket.on('disconnect', () => {
			});
		});
	};

module.exports = { initialize };