module.exports = function(app, testvar, Poem_Database){
	//console.log(testvar);
	var path = require('path');
	
	var test = require('./controllers/HelloWorld');
	app.get('/api/HelloWorld',function(req,res){
		test.respond(req, res, testvar);
		/**
		console.log(testvar);
		testvar = "Second call"
		res.send([{
			id:1,
			message:'Hello World Works!!',
			type:'This is only for TEST Purpose'
		}]);**/
	});
	

	/** Routes to be implemented **/

	// GET list_poems
	var list_poems = require('./controllers/list_poems');
	app.get('/api/list_poems', list_poems.allPoems);
	app.get('/api/list_poems/:srcPoem', list_poems.fromSrcPoem);



	// GET poem/<pid>
	var poem = require('./controllers/poem');
	app.get('/api/poem', function(req,res){
		poem.findAndReturnPoemById(req, res, Poem_Database);
	});
	app.get('/api/poem', function(req,res){
		poem.findAndReturnPoemByTitle(req, res, Poem_Database);
	});


	// GET tree/<pid>
	var tree = require('./controllers/tree');
	app.get('/api/tree/:pid', tree.findAndReturnTreeBySourcePoemId);

	// GET display/<pid>
	var display = require('./controllers/display');
	app.get('/api/display', function(req,res){
		display.getObjectsToDisplay(req, res, Poem_Database);
	});


	// POST new_poem/<pid>
	var new_poem = require('./controllers/new_poem');
	app.post('/api/new_poem', function(req,res){
		new_poem.onNewPoemGenerated(req, res, Poem_Database);
	});

	//Route for index.html in angular front end
	app.get('*', function (req, res){
		res.sendFile(path.join(__dirname, "/index.html"));
	});
}