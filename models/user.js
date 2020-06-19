const mongoose = require('mongoose'),
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
	},
	password: {
		type: String,
		required: 'Password is required',
		match: [/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, '{VALUE} is not a valid password']
	}
});

UserSchema.set('timestamps', true);

UserSchema.pre('save', function (next) {
	var user = this;

	// Only hash the password if it has been modified (or is new)
	if (!user.isModified('password')) return next();

	// Generate a salt
	bcrypt.genSalt(10, (err, salt) => {
		if (err) return next(err);

		// Hash the password using our new salt
		bcrypt.hash(user.password, salt, (err, hash) => {
			if (err) return next(err);

			// Override the cleartext password with the hashed one
			user.password = hash;
			return next();
		});
	});
});

UserSchema.methods.comparePassword = function (candidatePassword, cb) {
	bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
		if (err) return cb(err);

		return cb(null, isMatch);
	});
};

module.exports = mongoose.model('Users', UserSchema);