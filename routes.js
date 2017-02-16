var bcrypt = require('bcrypt');
const SALTROUNDS = 7;
var mongoose = require('mongoose');	
var config = require('./config');	
var morgan = require('morgan');

module.exports = function(app, router, bodyParser, jwt) {
	//API ROUTES

 	if(app.get("env")=="production") {

        var accessLogStream = fs.createWriteStream(__dirname + '/logs/' + "access.log", {flags: 'a'});
        app.use(morgan({stream: accessLogStream}));
    }
     else {
        app.use(morgan("dev")); //log to console on development
    }

	mongoose.connect(config.database);

	var User = require('./app/models/user');	

	// middleware to use for all requests
	router.use(function(req, res, next) {
	    // do logging
	    //console.log('Request is:', req, 'Response is:', res);
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "X-Requested-With");
		res.header('Access-Control-Allow-Headers', 'Content-Type');    
	    next(); // make sure we go to the next routes and don't stop here
	});

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

					if( !bcrypt.compareSync(req.body.password, user.password) ) {
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
			user.password = bcrypt.hashSync(req.body.password, SALTROUNDS);

			user.save(function(err) {
				if(err) {
					res.send(err);
				} else {

					var token = jwt.sign({email: user.email}, req.app.settings.superSecret, {
						expiresIn: 1440 * 14 //24 hours
					});

					res.json({
						success: true,
						token: token
					});
				}
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
		.get(function(req, res) {
			console.log('req is: ', req, 'req.params.email is: ', req.params.user_email);
			var authorized = false;

			var token = req.body.token || req.query.token || req.headers['x-access-token'];
			if(token) {
				jwt.verify(token, req.app.settings.superSecret, function(err, decoded) {
					if(err){
						return res.json({success: false, message: 'Failed authenticate token.'})
					} else {
						req.decoded = decoded;
						authorized = true;
					}
				})
			}

			User.findOne({ 'email': req.params.user_email }, function(err, user) {
				if(err) {
					res.send(err);
				}
				if(user){
					res.json({email: user.email, success: true});
				} else {
					res.json({email: null, success: true})
				}			

				//may want to change access levels for those with vs. without tokens
				if(authorized) {
					if(user){
						res.json({email: user.email, success: true});
					} else {
						res.json({email: null, success: true})
					}	
				} else {
					if(user){
						res.json({email: user.email, success: true});
					} else {
						res.json({email: null, success: true})
					}	
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

	var Entity = require('./app/models/entity');

	router.route('/entity')
		.post(checkToken, function(req, res) {
			var entity = new Entity();
			var user = new User();
			entity.submittedByEmail = req.body.email; 
			entity.name = req.body.name;

			Entity.findOne({name: entity.name}, function(err, existingEntity) {
				if(!existingEntity) { 
					User.findOne({email: entity.submittedByEmail}, function(err, existingUser) {
						var userId = existingUser._id;
						entity.submittedByUser = userId;
						console.log('entity is: ', entity)						
						entity.save(function(err) {
							if(err) {
								res.json({error: err, message: 'Save entity error.', success: false});
							} else {
								res.json({message: 'New entity with name ' + entity.name + ' created.', success: true})
							}
							
						})
					})
				} else {
					res.json({message: 'Entity with name ' + entity.name + ' already exists.', success: false})
				}
			})

		})
		.get(function(req, res) {
			Entity.find({}, '-_id name createdAt').sort('-createdAt').limit(10).exec(function(err, entities) {
				if(err) {
					res.json({error: err, message: 'Get entities error.', success: false})
				} else {
					res.json({entities: entities, success: true})
				}
			})
			//res.json({message: 'Entity request received.', success: true})
		})

	// all of our routes will be prefixed with /api
	app.use('/api', router);	
}