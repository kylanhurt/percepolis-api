var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var morgan = require('morgan');
var jwt = require('jsonwebtoken');
var config = require('./config');
var router = express.Router();              // get an instance of the express Router

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var routes = require('./routes')(app, router, bodyParser, jwt);

var port = process.env.PORT || 8088;        // set our port

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'API functioning correctly.' });   
});

app.set('superSecret', config.secret);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Larang API happenning on port ' + port);