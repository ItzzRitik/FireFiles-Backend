const mongoose = require('mongoose'),
	validator = require('validator');

let UserSchema = new mongoose.Schema({
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
	},
});

UserSchema.pre('save', (next) => {
	var user = this;

	// Only hash the password if it has been modified (or is new)
	if (!user.isModified('password')) return next();

	// Generate a salt
	bcrypt.genSalt('SALT_WORK_FACTOR', (err, salt) => {
		if (err) return next(err);

		// Hash the password using our new salt
		bcrypt.hash(user.password, salt, (err, hash) => {
			if (err) return next(err);

			// Override the cleartext password with the hashed one
			user.password = hash;
			next();
		});
	});
});

UserSchema.methods.comparePassword = (candidatePassword, cb) => {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

module.exports = mongoose.model('Users', UserSchema);