
/**
 ** Output: flat JSON object with list of all poem titles, pids, and child ids, but no text
 ** This request is used to load the global poem map for rendering the global tree cluster on the main navigation page
 **/
exports.allPoems = function(req,res) {}

/**
 ** TO BE IMPLEMENTED only when requirement arises
 ** Output: flat JSON object with list of all poem titles, pids, and child ids, but no text under the contect of a source poem as root.
 ** This request is used to load the global poem map for rendering the global tree cluster on the main navigation page with the source poem as center of the spacial context.
 **/
exports.fromSrcPoem = function(req,res) {}

/**
 ** Dev API- Need to be removed later
 **/
exports.generatePoemFiles = function(req,res) {

	// Local File system library
	var Store = require('jfs');
	var db = new Store('data');
	var _ = require('lodash');

	var d = {
		foo: "bar"
	};

	db.save("testJSON", d, function(err){
	  // now the data is stored in the file data/anId.json
	});

	var poemsJSON = require('../data/SourcePoems.json');

	_.forEach({ 'a': 1, 'b': 2 }, function(n) {
		console.log(n);
	});

	//res.send("Poem Generation success!!");
}