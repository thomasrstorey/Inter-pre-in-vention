var express = require('express');

var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var _ = require('lodash');


// Create the application.
var app = express();
// Add Middleware necessary for REST API's
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(methodOverride('X-HTTP-Method-Override'));

// CORS Support
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

var port = process.env.PORT || 8989;

//start server
console.log("listening on port: " + port);
app.listen(port);

