/**
 ** Input: generated poem text as a string, with pid number of appropriate parent specified in the request
 ** Input will be inside post data : req.body
 ** Input will structured as a JSON with pid(parentId, generatedText, metadata)
 ** Output: http status code 200 if successful, if input is wrong send 400, if server messes up, send 500
 ** Used to send a newly read poem to the backend to be added to the tree, processed in realtime locally and later processed offline globally
 **/
exports.onNewPoemGenerated = function(req,res) {

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

	var levenshtein = require('fast-levenshtein');
	var fs = require('fs');
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