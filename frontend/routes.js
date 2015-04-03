//node routing - for now just handle routing with angular
var path = require('path');

module.exports = function (app) {
	app.get('/api/poems/:pid', function (req, res) {
		res.sendFile(path.join(__dirname, "/data/"+req.params.pid+".txt"));
	});

	app.get('/api/poems_list/', function (req, res) {
		res.sendFile(path.join(__dirname, "/data/pdb.json"));
	});

	app.get('/api/dists_list/', function (req, res) {
		res.sendFile(path.join(__dirname, "/data/distdb_test.json"));
	});

	app.get('*', function (req, res){
		res.sendFile(path.join(__dirname, "/index.html"));
	});
};
