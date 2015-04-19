(function(){
	var _ = require('lodash');
	/**
	 ** Output: a flat JSON object with all the source poem objects that are part of the original emily dickinson collection.
	 ** Used to load all the data related to a particular tree
	 **/
	exports.returnOriginalPoemsSpace = function(req,res) {

		var poem_pid = req.query.pid;

		var res_JSON = {"poem_objects":[], "object_connections":[], "object_distances":[], "object_lineage":[]};

		var Original_Poem_Database = require('../data/originalpoems/Poem_Database.json');

		_.forEach(Original_Poem_Database, function(poemObject, index) {

			res_JSON.poem_objects.push({"pid":poemObject.pid, "title":poemObject.title, "metadata":[{"isSourcePoem":true}]});

			if(poemObject.pid == poem_pid){
				var links_pid = require("../data/originalpoems/links/"+ poem_pid +".json");
				res_JSON.object_distances = links_pid;
			}
		});
		res.json(res_JSON);
	};

	/**
	 ** Output: a flat JSON object with all the poem objects that are part of the tree that has the specified source poem as its root. (including text)
	 ** Used to load all the data related to a particular tree
	 **/
})();
