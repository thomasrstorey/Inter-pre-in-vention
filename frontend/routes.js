//node routing - for now just handle routing with angular
var path = require('path');
var fs = require('fs');

module.exports = function (app) {
	app.get('/api/poems/:pid', function (req, res) {
		fs.readFile(path.join(__dirname, "/data/pdb.json"), {encoding: 'utf8'}, function (e, d){
			if(e){
				console.log(e);
			} else {
				var pdb = JSON.parse(d);
				res.send(pdb[req.params.pid]);
			}
		});
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
