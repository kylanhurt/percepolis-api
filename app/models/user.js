var mongoose = require('mongoose');
/*mongoose.connect('mongodb://localhost:27017/larang');

var UserSchema = new mongoose.Schema({
	name: String,
	email: String,
	password: String,
	remember_token: String,
	created_at: Date,
	updated_at: Date
});

var User = mongoose.model('User', UserSchema);

var newUser = new User({'Kylan Hurt', 'kylan.hurt@gmail.com', 'Pu1ssant', 'asdfasdfasdfasdfsdf' });

newUser.save(function(error) {
	if(error){
		console.log('newUser error:', error);
	} else {
		console.log('newUser:', newUser);
	}
});*/

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