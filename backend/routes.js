module.exports = function(app){
	/**
	var test = require('./controllers/HelloWorld');
	app.get('/HelloWorld',test.respond);
	**/

	/** Routes to be implemented **/

	// GET list_poems
	var list_poems = require('./controllers/list_poems');
	app.get('api/list_poems', list_poems.allPoems);
	app.get('api/list_poems/:srcPoem', list_poems.fromSrcPoem);

	// GET poem/<pid>
	var poem = require('./controllers/poem');
	app.get('api/poem/:pid', poem.findAndReturnPoemById);
	app.get('api/poem/:pTitle', poem.findAndReturnPoemByTitle);

	// GET tree/<pid>
	var tree = require('./controllers/tree');
	app.get('api/tree/:pid', tree.findAndReturnTreeBySourcePoemId);

	// POST new_poem/<pid>
	var new_poem = require('./controllers/new_poem');
	app.post('api/new_poem', new_poem.onNewPoemGenerated);
}