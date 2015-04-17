(function(){
	var _ = require('lodash');
	var levenshtein = require('fast-levenshtein');
	var fs = require('fs');
	var Store = require('jfs');
	var data_db = new Store('data/poems',{pretty:true});
	var data_links_db = new Store('data/poems/links',{pretty:true});
	/**
	 ** Input: generated poem text as a string, with pid number of appropriate parent specified in the request
	 ** Input will be inside post data : req.body
	 ** Input will structured as a JSON with pid(parentId, generatedText, metadata)
	 ** Output: http status code 200 if successful, if input is wrong send 400, if server messes up, send 500
	 ** Used to send a newly read poem to the backend to be added to the tree, processed in realtime locally and later processed offline globally
	 **/
	exports.onNewPoemGeneratedTemp = function(req,res) {

		var express = require("express");
		var bodyParser = require("body-parser");
		var app = express();
		
		//Here we are configuring express to use body-parser as middle-ware.
		app.use(bodyParser.urlencoded({ extended: false }));

		/*
		 	** RETRIEVE POST REQUEST PARAMS
				* MAKE SURE THAT THE REQUEST CONTAINS THE POEM TEXT WITH THE '\n' TAGS
		*/
		var parentPID = req.body.pid;
		var newPoem = req.body.poem;

		
		
		var poemsDir = __dirname + '/Poems/';

		// GET THE LIST OF POEM JSON FILES IN THE DIRECTORY
		var files = fs.readdirSync(poemsDir);

		var links = [];

		// CONSTRUCT THE NEW POEM JSON OBJECT TO BE WRITTEN OUT TO <PnewPoemObj.pid>.JSON FILE
		var newPoemObj = {};
		newPoemObj.pid = "123456qwerty";
	 	newPoemObj.title = "123456qwerty New text"; 
	 	newPoemObj.poem = newPoem;
	 	newPoemObj.children = "";
	 	newPoemObj.orig_src = parentPID;
	 	newPoemObj.poem_num = "";
	 	newPoemObj.userdata = "";
	 	newPoemObj.links = links;

	    var startTime = new Date().valueOf();
	    var parsedPoem, poem, distance;
	    var jsonString, jsonParsedPoem;

	    /*
	    	* ITERATE OVER ALL THE POEM JSON FILES PRESENT IN THE DIRECTORY
	    	* RETRIEVE THE POEM TEXT
	    	* COMPUTER THE LEVENSHTEIN'S DISTANCE BETWEEN THIS POEM TEXT AND THE NEW
	    		POEM TEXT
	    	* WRITE IT TO THE links FIELD IN THE NEW POEM JSON OBJECT
	    	* ONCE WE ARE DONE WITH THIS FOR ALL THE POEMS JSON FILES PRESENT IN THE DIRECTORY,
	    		WRITE THE NEW POEM TO THE SAME DIRECTORY AS <PnewPoemObj.pid>.JSON
	    */
	    for (var i in files) {

	    	parsedPoem = require(poemsDir + files[i]);
	    	poem = parsedPoem.poem;

	    	distance = levenshtein.get(newPoem, poem); 

			newPoemObj.links.push({pid: parsedPoem.pid, dist: distance});
	      	jsonString = JSON.stringify(newPoemObj);

	      	/* 	UPDATE THE links FIELD OF THE ALREADY PRESENT POEM WITH THE
	      		PID OF THE NEW POEM AND THE LEVENSHTEIN'S DISTANCE BETWEEN
	      		THESE TWO POEMS
	      	*/
	      	parsedPoem.links.push({pid: newPoemObj.pid, dist: distance});
	      	jsonParsedPoem = JSON.stringify(parsedPoem);
	      	fs.writeFileSync(poemsDir + files[i], jsonParsedPoem);
	    } 

	    // WRITE THE NEW POEM TO THE SAME DIRECTORY AS <PnewPoemObj.pid>.JSON
	    fs.writeFileSync(poemsDir + newPoemObj.pid + '.json', jsonString);

	    //console.log('Time taken: ' + (new Date().valueOf() - startTime));

	    // SEND THE TIME TAKEN (TO WRITE THIS NEW POEM JSON FILE + UPDATE THE ALREADY PRESENT
	    // POEM FILES) BACK IN THE RESPONSE
	    res.send('Time taken: ' + (new Date().valueOf() - startTime));
	}

	exports.onNewPoemGenerated = function(req, res, Poem_Database) {

		var parentpid = req.body.pid;
		var parentTitle = req.body.pTitle;
		var newPoem = req.body.poem;
		//console.log(parentpid+parentTitle+newPoem);

		var new_pid = Poem_Database.length;

		var newPoemObj = {};

		newPoemObj.pid = new_pid;
		newPoemObj.title = parentTitle+new_pid;
		newPoemObj.poem = newPoem;
		newPoemObj.parentpid = Number(parentpid);
		newPoemObj.children = [];
		newPoemObj.poem_num = -1;
		newPoemObj.links_generated = false;

		_.forEach(Poem_Database, function(poemObject, index) {
			if(poemObject.pid == parentpid){
				newPoemObj.orig_src = poemObject.orig_src;
				return false;
			}
		});

		Poem_Database.push(newPoemObj);
		//console.log(Poem_Database);
		

		// Calculate the levenstein distances for all the poems with the new poem
		var linksFileJSON = new Array();
		_.forEach(Poem_Database, function(poemObject, index) {

			var lev_dist = levenshtein.get(poemObject.poem, newPoem);
			linksFileJSON.push({"pid":poemObject.pid, "distance":lev_dist, "metadata":[]});

			if(poemObject.pid != new_pid){
				var otherPoemLinkFile = require('../data/poems/links/'+poemObject.pid+'.json');
				otherPoemLinkFile.push({"pid":new_pid, "distance":lev_dist, "metadata":[]});
				data_links_db.saveSync(poemObject.pid, otherPoemLinkFile);
			}
			
		});

		_.forEach(Poem_Database, function(poemObject, index) {

			if(poemObject.pid == new_pid){
				poemObject.links_generated = true;
			}
		});

		data_db.saveSync("Poem_Database", Poem_Database);
		data_links_db.saveSync(new_pid, linksFileJSON);

		res.json({"newpoem_pid":new_pid});
	}

})();

