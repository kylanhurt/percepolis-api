var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8088;        // set our port

var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    //console.log('Request is:', req, 'Response is:', res);
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	res.header('Access-Control-Allow-Headers', 'Content-Type');    
    next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });   
});

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------


// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Larang API happenning on port ' + port);

mongoose.connect('mongodb://localhost:27017/larang');

var User = require('./app/models/user');



//API ROUTES
//================================


router.route('/users')
	.post(function(req, res) {
		var user = new User();
		user.email = req.body.email; 
		user.password = req.body.password;

		user.save(function(err) {
			if(err) {
				res.send(err);
			}

			res.json({ message: "User created!" });
		});
	})

	.get(function(req, res) {
		User.find(function(err, users) {
			if(err) {
				res.send(err);
			}

			res.json(users);
		});
	});

router.route('/users/:user_email')
	.get(function(req, res) {
		User.findOne({ 'email': req.params.user_email }, function(err, user) {
			if(err) {
				res.send(err);
			}
			res.json(user);
		});
	})

	.put(function(req, res) {
		User.findOne({'email': req.params.user_email}, function(err, user) {
			if(err) {
				res.send(err);
			}
			user.email = req.body.email;
			user.save(function(err) {
				if(err){
					res.send(err);
				}
				res.json({message: 'User updated!, req.params.user_email is: ' + req.body.email});
			})
		})
	})

	.delete(function(req, res) {
		User.findOne({
			'email': req.params.user_email
		}).remove(function(err, user) {
			if(err) {
				res.send(err);
			}
			res.json({ message: 'User with email: ' + req.params.user_email + ' has been deleted.' });
		})
	})



// all of our routes will be prefixed with /api
app.use('/api', router);