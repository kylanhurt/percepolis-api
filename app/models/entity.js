var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');

var Schema = mongoose.Schema;

var EntitySchema = new Schema({
	name: {
		type: String,
		required: true,
		unique: true
	},
	website: String,
	description: String,
	yearFounded: {
		type: Number, 
		max: 2016
	},
	country: {
		type: String,
		minlength: 3,
		maxlength: 300
	},
	industry: {
		type: String,
		minlength: 3,
		maxlength: 300
	},
	submittedByUser: 
		[{ type: Schema.Types.ObjectId, ref: 'User' }]
	}, {
		timestamps: true
	}
);



module.exports = mongoose.model('Entity', EntitySchema);