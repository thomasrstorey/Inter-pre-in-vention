(function(){
	var express = require('express');

	var bodyParser = require('body-parser');
	var methodOverride = require('method-override');


	// Create the application.
	var app = express();
	// Add Middleware necessary for REST API's
	app.use(bodyParser.urlencoded({extended: true}));
	app.use(bodyParser.json());
	app.use(bodyParser.json({ type: 'application/vnd.api+json'}));
	app.use(methodOverride('X-HTTP-Method-Override'));
	app.use(express.static(__dirname));

	// CORS Support
	app.use(function(req, res, next) {
	  res.header('Access-Control-Allow-Origin', '*');
	  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	  res.header('Access-Control-Allow-Headers', 'Content-Type');
	  next();
	});

	
	generateBigPoemJSONFileLinks = function() {
		var Store = require('jfs');
		var data_db = new Store('data/poems',{pretty:true});
		var data_links_db = new Store('data/poems/links',{pretty:true});
		var data_original_db = new Store('data/originalpoems',{pretty:true});
		var data_links_original_db = new Store('data/originalpoems/links',{pretty:true});
		var _ = require('lodash');
		var levenshtein = require('fast-levenshtein');

		var poems = require('./data/poems/Poem_Database.json');


		console.log("links are generating!!!");
		_.forEach(poems, function(poem, index) {
			var linksFileJSON = new Array();
			_.forEach(poems, function(otherpoem, otherpoem_index){

				var lev_dist = levenshtein.get(poem.poem, otherpoem.poem);
				linksFileJSON.push({"pid":otherpoem.pid, "distance":lev_dist, "metadata":[]});

			});
			poem.links_generated = true;
			data_links_db.saveSync(poem.pid, linksFileJSON);
			data_links_original_db.saveSync(poem.pid, linksFileJSON);
			// //console.log("links_generated", poem.pid);
			// if(index == 10){
			// 	return false;
			// }
			
		});

		console.log("Now writing Poem_Database file...");
		data_db.saveSync("Poem_Database", poems);
		data_original_db.saveSync("Poem_Database", poems);
	}

	generatePoemFiles = function() {

		var Store = require('jfs');
		var data_db = new Store('data/poems',{pretty:true});
		var data_original_db = new Store('data/originalpoems',{pretty:true});
		var _ = require('lodash');

		var poems = require('./data/SourcePoems.json');
		var poemsJSON = new Array();

		_.forEach(poems, function(poem, index) {
			var indexed_poem = poem;

			indexed_poem.pid = index;
			indexed_poem.children = [];
			indexed_poem.orig_src = index;
			indexed_poem.parentpid = -1
			indexed_poem.links_generated = false;

			poemsJSON.push(indexed_poem);
		});

		data_db.saveSync("Poem_Database", poemsJSON);
		data_original_db.saveSync("Poem_Database", poemsJSON);

		console.log("SUCCESS: Poem_Database generated!!!");
	}

	if(process.argv[2] && process.argv[2] == 'pre-process'){
		//console.log(process.argv[2]);
		var startTime = new Date().valueOf();
		generatePoemFiles();
		console.log('Time taken for Poem_Database generation in seconds: ' + (new Date().valueOf() - startTime)/1000 +'seconds');
		var startTime1 = new Date().valueOf();
		generateBigPoemJSONFileLinks();
		console.log('Time taken for links generation in seconds: ' + (new Date().valueOf() - startTime1)/1000 +'seconds');
		console.log('All pre-processing completed');
	}

	var port = process.env.PORT || 8989;

	// Poem_Database
	var Poem_Database = require('./data/poems/Poem_Database.json');

	//Test
	var testvar = "First call";

	//Routes addition
	require('./routes')(app, testvar, Poem_Database);

	//start server
	console.log("listening on port: " + port);
	app.listen(port);
	module.exports = app;
	

})();