module.exports = function(app){
	var test = require('./controllers/HelloWorld');
	app.get('/HelloWorld',test.respond);
}