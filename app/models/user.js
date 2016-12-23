var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema = new Schema({
	name: String,
	email: String,
	password: String,
	remember_token: String,
	created_at: Date,
	updated_at: Date	
});

module.exports = mongoose.model('User', UserSchema);