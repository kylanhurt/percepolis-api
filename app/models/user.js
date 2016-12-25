var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema = new Schema({
	name: String,
	email: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true
	},
	remember_token: String,
	created_at: Date,
	updated_at: Date	
});

module.exports = mongoose.model('User', UserSchema);