
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
	var db = new Store('data/originalpoems',{pretty:true});
	var _ = require('lodash');
	var uid = require('uid');
	var fs = require('fs-extra');

	/**
	var d = {
		foo: "bar"
	};

	db.save("testJSON", d, function(err){
	  // now the data is stored in the file data/anId.json
	});
	

	_.forEach({ 'a': 1, 'b': 2 }, function(n,key) {
		db.save("test"+ key, n, function(err){
		  // now the data is stored in the file data/anId.json
		});
	});

	**/

	var poemsJSON = require('../data/SourcePoems.json');
	var numFilesGenerated = 0;
	var originalpoem_index = new Array();

	_.forEach(poemsJSON, function(n,key) {
		var current_poem = n;
		var poemFileSaved = false;
		var poem_index = new Object();

		try{
			do{
				var upid = uid(20);
				var file = '../data/originalpoems/'+upid+'.json';
				fs.ensureFile(file, function (err) {
					//console.log("File does not exist");
					n.pid = upid;
					n.children = [];
					n.userdata = [];
					n.links = [];
					db.save(n.pid, n, function(err){
						if(err){
							console.log("Error occurred while saving poem file: "+ n.title);
						}
					});
				});
				numFilesGenerated = numFilesGenerated+1;
				poemFileSaved = true;
				poem_index["pid"] = upid;
				originalpoem_index.push(poem_index);
				
				//console.log(numFilesGenerated);
			}while(!poemFileSaved);
			db.save("index", originalpoem_index, function(err){
				if(err){
					console.log("Error occurred while saving poem index file: ");
				}
			});
		}
		catch(e){
			console.log('Unexpected error occurred' + e);
		}
	});

	var Output = {"numFilesGenerated": numFilesGenerated,"type": "JSON", "indexFile": "originalpoem_index.JSON"};

	res.send(Output);
}