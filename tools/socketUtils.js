require('dotenv').config();
const logger = require('./logger'),
	chalk = require('chalk'),
	dbUtils = require('./dbUtils'),

	initialize = (io, cookieSession) => {
		logger.log(false, chalk.green('SocketIO Service Established'));
		io.use((socket, next) => {
			cookieSession(socket.request, socket.request.res, () => {
				if (!socket.request.session.passport)  return next(new Error('forbidden'));
				next();
			});
		});

		io.on('connection', (socket) => {
			var email = socket.request.session.passport.user;
			dbUtils.getUserData(email, '', (err, id, user) => {
				socket.join(id);
				socket.emit('userData', user);
			});
        
			socket.on('disconnect', () => {
			});
		});
	};

module.exports = { initialize };