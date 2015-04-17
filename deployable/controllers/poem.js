(function(){
	var _ = require('lodash');
	/**
	 ** Output: flat JSON poem object specified by the pid provided in the request
	 ** This request is used to load the poem text and related info for the reader view (as prompt for reading a new poem)
	 **/
	exports.findAndReturnPoemById = function(req, res, Poem_Database) {

		var req_pid = req.query.pid;
		var poem_text = "";
		console.log(req_pid);

		_.forEach(Poem_Database, function(poemObject, index) {
			if(poemObject.pid == req_pid){
				poem_text = poemObject.poem;
				return false;
			}
		});

		if(poem_text != ""){
			res.json({"text": poem_text, "ErrorType": "No Errors"});
		}
		else{
			res.json({"text": poem_text, "ErrorType": "Request pid not found"});
		}

		//console.log(Poem_Database.length);

	}

	/**
	 ** TO BE IMPLEMENTED only when requirement arises
	 ** Output: flat JSON poem object specified by the pTitle provided in the request
	 **/
	exports.findAndReturnPoemByTitle = function(req, res, Poem_Database) {

		var req_title = req.query.title;
		var poem_text = "";

		_.forEach(Poem_Database, function(poemObject, index) {
			if(poemObject.title == req_title){
				poem_text = poemObject.poem;
				return false;
			}
		});

		if(poem_text != ""){
			res.JSON({"text": poem_text, "ErrorType": "No Errors"});
		}
		else{
			res.JSON({"text": poem_text, "ErrorType": "Request pid not found"});
		}
	}

})();
