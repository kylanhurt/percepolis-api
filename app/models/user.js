var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var UserSchema = new Schema({
	name: String,
	email: {
		type: String,
		required: true,
		unique: true,
		uniqueCaseInsensitive: true
	},
	password: {
		type: String,
		required: true
	},
	remember_token: String
	}, {
		timestamps: true
	}
);

UserSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', UserSchema);