const mongoose = require('mongoose'),
	passportLocalMongoose = require('passport-local-mongoose'),
	bcrypt = require('bcrypt'),
	validator = require('validator');

let UserSchema = new mongoose.Schema({
		name: String,
		email: {
			type: String,
			trim: true,
			lowercase: true,
			unique: true,
			index: { unique: true },
			required: 'Email address is required',
			validate: {
				validator: validator.isEmail,
				message: '{VALUE} is not a valid email',
				isAsync: false
			}
		}
	}),
	passwordValidator = (password, cb) => {
		var regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;
		if (!password.match(regex)) {
			return cb(password + 'is not a valid password');
		}
		return cb();
	};

UserSchema.set('timestamps', true);
UserSchema.plugin(passportLocalMongoose, {
	usernameField: 'email',
	usernameLowerCase: true,
	passwordValidator: passwordValidator,
	errorMessages: {
		IncorrectPasswordError: 'Password incorrect',
		IncorrectUsernameError: 'There is no account registered with that email',
		UserExistsError: 'Oops! Account with same email already exists! Try logging in or use a different email.'
	}
});

module.exports = mongoose.model('Users', UserSchema);