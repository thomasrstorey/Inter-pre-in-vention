//node routing - for now just handle routing with angular
module.exports = function (app) {
	app.get('*', function(req, res){
		res.sendFile('index.html', {root: __dirname});
	})
};
