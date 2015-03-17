//node routing - for now just handle routing with angular
var path = require('path');

module.exports = function (app) {
	app.get('*', function (req, res){
		res.sendFile(path.join(__dirname, "/index.html"));
	});
};
