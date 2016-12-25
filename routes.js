module.exports = function(app, router, bodyParser, jwt) {
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
}