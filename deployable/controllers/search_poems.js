(function(){

	var _ = require('lodash');

	/**
	 ** Output: flat JSON object with list of all poem titles, pids, and child ids, but no text
	 ** This request is used to load the global poem map for rendering the global tree cluster on the main navigation page
	 **/
	exports.searchByPoemTitleKeyword = function(req, res, Poem_Database) {

		var searchVal = req.query.searchValue;
		//console.log(searchVal);

		var res_JSON = {"poem_objects":[]};

		if(searchVal && searchVal !=''){
			_.forEach(Poem_Database, function(poemObject, index) {
				if(poemObject.title.toLowerCase().indexOf(searchVal) > -1 || poemObject.title.toLowerCase().indexOf(searchVal.toLowerCase()) > -1){
					if(poemObject.parentpid == -1){
						res_JSON.poem_objects.push({"pid":poemObject.pid, "title":poemObject.title, "metadata":[{"isSourcePoem":true}]});
						//res_JSON.poem_objects.metadata.push({"isSourcePoem":true});
					}
					else{
						res_JSON.poem_objects.push({"pid":poemObject.pid, "title":poemObject.title, "metadata":[{"isSourcePoem":false}]});
						//res_JSON.poem_objects.metadata.push({"isSourcePoem":false});
					}
				}
			});
			//console.log(res_JSON.poem_objects.length);
			res.json(res_JSON);
		}
		else{
			res.json(res_JSON);
		}
	};

	/**
	 ** TO BE IMPLEMENTED only when requirement arises
	 ** Output: flat JSON object with list of all poem titles, pids, and child ids, but no text under the contect of a source poem as root.
	 ** This request is used to load the global poem map for rendering the global tree cluster on the main navigation page with the source poem as center of the spacial context.
	 **/
	exports.searchByPoemTextKeyword = function(req, res, Poem_Database) {

		var searchVal = req.query.searchValue;

		var res_JSON = {"poem_objects":[]};

		if(searchVal && searchVal !=''){
			_.forEach(Poem_Database, function(poemObject, index) {
				if(poemObject.poem.toLowerCase().indexOf(searchVal) > -1 || poemObject.poem.toLowerCase().indexOf(searchVal.toLowerCase()) > -1){
					if(poemObject.parentpid == -1){
						res_JSON.poem_objects.push({"pid":poemObject.pid, "title":poemObject.title, "metadata":[{"isSourcePoem":true}]});
						//res_JSON.poem_objects.metadata.push({"isSourcePoem":true});
					}
					else{
						res_JSON.poem_objects.push({"pid":poemObject.pid, "title":poemObject.title, "metadata":[{"isSourcePoem":false}]});
						//res_JSON.poem_objects.metadata.push({"isSourcePoem":false});
					}
				}
			});
			res.json(res_JSON);
		}
		else{
			res.json(res_JSON);
		}
	};

})();