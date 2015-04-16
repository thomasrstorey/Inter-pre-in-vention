(function(){
	var _ = require('lodash');
	/**
	 ** Output: 
	 **/
	exports.getObjectsToDisplay = function(req,res, Poem_Database) {

		var poem_pid = req.query.pid;
		var res_JSON = {"poem_objects":[], "object_connections":[], "object_distances":[], "object_lineage":[]};

		//try{
			_.forEach(Poem_Database, function(poemObject, index) {

				//res_JSON.poem_objects.push({"pid":poemObject.pid, "title":poemObject.title, "metadata":[]});
				if(poemObject.parentpid == -1){
					res_JSON.poem_objects.push({"pid":poemObject.pid, "title":poemObject.title, "metadata":[{"isSourcePoem":true}]});
					//res_JSON.poem_objects.metadata.push({"isSourcePoem":true});
				}
				else{
					res_JSON.poem_objects.push({"pid":poemObject.pid, "title":poemObject.title, "metadata":[{"isSourcePoem":false}]});
					//res_JSON.poem_objects.metadata.push({"isSourcePoem":false});
				}
				_.forEach(poemObject.children, function(child, child_index){

					res_JSON.object_connections.push({"source_index":poemObject.pid, "target_index":child.pid});
				});

				if(poemObject.pid == poem_pid){
					var links_pid = require("../data/poems/links/"+ poem_pid +".json");
					res_JSON.object_distances = links_pid;

					/**
					var poem_ppid = poemObject.parentpid;
					while(poem_ppid != -1){
						res_JSON.object_lineage.push(poem_ppid);
						_.forEach(Poem_Database, function(parentPoemObject, Pindex) {
							if(parentPoemObject.pid == poem_ppid){
								poem_ppid = parentPoemObject.parentpid;
								return false;
							}
						});
					}**/
				}
			});

			res.json(res_JSON);
		//}
		//catch(ex){
		//	console.log(ex);
		//	res.json({"ERROR": "Getting display objects"});
		//}
	}
})();