const mongoose = require('mongoose'),
	passportLocalMongoose = require('passport-local-mongoose'),
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
	passwordValidator = (password, next) => {
		var regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
		if (!password.match(regex)) {
			// Invalid password error
			return next({
				name: 'InvalidPasswordError',
				message: 'Oops! The password you\'ve entered is not valid'
			});
		}
		return next();
	};

UserSchema.set('timestamps', true);
UserSchema.plugin(passportLocalMongoose, {
	usernameField: 'email',
	hashField: 'password',
	usernameLowerCase: true,
	passwordValidator: passwordValidator,
	errorMessages: {
		IncorrectPasswordError: 'Oops! The password you\'ve entered is incorrect',
		IncorrectUsernameError: 'Uh-Uh! Account with this email doesn\'t exist!',
		MissingUsernameError: 'Email is required to create your account',
		MissingPasswordError: 'Password is required to create your account',
		UserExistsError: 'Oops! Account with same email already exists! Try logging in or use a different email.'
	}
});

module.exports = mongoose.model('Users', UserSchema);