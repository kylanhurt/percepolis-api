var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var config = require('./config');
var router = express.Router();              // get an instance of the express Router

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var port = process.env.PORT || 8088;        // set our port



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
    res.json({ message: 'API functioning correctly.' });   
});

mongoose.connect(config.database);

var User = require('./app/models/user');
app.set('superSecret', config.secret);




//API ROUTES
//================================

router.route('/authenticate')
	.post(function(req, res) {
		User.findOne({ 
			email: req.body.email 
		}, function(err, user) {
			if(err) {
				res.send(err);
			}

			if(!user) {
				res.status(401).json({success: false, message: "Authentication failed. Email and password combo invalid."})
			} else if (user) {
				if(user.password != req.body.password) {
					res.status(401).json({ success: false, message: "Authentication failed. Email and password combo invalid." })
				} else {
					var token = jwt.sign({email: user.email}, req.app.settings.superSecret, {
						expiresIn: 1440 //24 hours
					});

					res.json({
						success: true,
						message: "Enjoy your token.",
						token: token
					});
				}
			}
		})
})

function checkToken(req, res, next) {
	var token = req.body.token || req.query.token || req.headers['x-access-token'];
	if(token) {
		jwt.verify(token, req.app.settings.superSecret, function(err, decoded) {
			if(err){
				return res.json({success: false, message: 'Failed authenticate token.'})
			} else {
				req.decoded = decoded;
				next();
			}
		})
	} else {
		return res.status(403).send({
			success: false,
			message: 'No token provided.'
		});
	}
}

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

	.get(checkToken, function(req, res) {
		User.find(function(err, users) {
			if(err) {
				res.send(err);
			}

			res.json(users);
		});
	});

router.route('/users/:user_email')
	.get(checkToken, function(req, res) {
		User.findOne({ 'email': req.params.user_email }, function(err, user) {
			if(err) {
				res.send(err);
			}
			if(user){
				res.json({email: user.email});
			}			
		});
	})

	.put(checkToken, function(req, res) {
		User.findOne({'email': req.params.user_email}, function(err, user) {
			if(err) {
				res.send(err);
			}
			if(!user) {
				res.json({
					success: false,
					message: 'User not found.'
				})			
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

	.delete(checkToken, function(req, res) {
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

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Larang API happenning on port ' + port);