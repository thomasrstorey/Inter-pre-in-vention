//node routing - for now just handle routing with angular
var path = require('path');
var fs = require('fs');

module.exports = function (app) {
	app.get('/api/poems/:pid', function (req, res) {
		res.sendFile(path.join(__dirname, "/data/poems/"+req.params.pid+".json"));
	});

	app.get('/api/poems_list/', function (req, res) {
		res.sendFile(path.join(__dirname, "/data/index_test.json"));
	});

	app.get('/api/links_list/', function (req, res) {
		res.sendFile(path.join(__dirname, "/data/links_test.json"));
	});

	app.get('/api/dists/:pid', function (req, res) {
		res.sendFile(path.join(__dirname, "/data/dists/"+req.params.pid+".json"));
	});

	app.get('*', function (req, res){
		res.sendFile(path.join(__dirname, "/index.html"));
	});
};
