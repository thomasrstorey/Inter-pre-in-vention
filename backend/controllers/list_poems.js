(function(){

	var Store = require('jfs');
	var data_db = new Store('data/poems',{pretty:true});
	var data_links_db = new Store('data/poems/links',{pretty:true});
	var _ = require('lodash');
	var levenshtein = require('fast-levenshtein');

	/**
	 ** Output: flat JSON object with list of all poem titles, pids, and child ids, but no text
	 ** This request is used to load the global poem map for rendering the global tree cluster on the main navigation page
	 **/
	exports.allPoems = function(req,res) {};

	/**
	 ** TO BE IMPLEMENTED only when requirement arises
	 ** Output: flat JSON object with list of all poem titles, pids, and child ids, but no text under the contect of a source poem as root.
	 ** This request is used to load the global poem map for rendering the global tree cluster on the main navigation page with the source poem as center of the spacial context.
	 **/
	exports.fromSrcPoem = function(req,res) {};

})();
