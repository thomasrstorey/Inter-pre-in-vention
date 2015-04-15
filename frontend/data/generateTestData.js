var fs = require('fs');
var _ = require('lodash');

//BUILD INDEX ==================================================================================================

var indexData = [];
var originalPoems = [0];
for(var i = 0; i != 3000; ++i){
	var os = Math.random() < 0.1;
	if(os) originalPoems.push(i);
	indexData.push({
		pid: i,
		title: Math.random().toString(36).replace(/[^a-zA-Z]/g, '').substr(0, Math.floor(Math.random()*12 + 5)),
		orig_src: os || i == 0 ? null : _.sample(originalPoems),
		ready: true
	});
}

fs.writeFileSync("./index_test.json", JSON.stringify(indexData));

//BUILD LINKS ==================================================================================================

var ops = _.filter(indexData, function (v) {
	return v.orig_src == null;
});

function buildTree (p, remPoems, treePoems) {
	var links = [];
	var numChildren = Math.floor(Math.random()*5);
	for(var i = 0; i != numChildren; i++) {
		if(remPoems.length > 1){
			var child = _.sample(remPoems);
			if(p.pid !== child.pid){
				links.push({source: p.pid, target: child.pid, value: 20});
				_.remove(remPoems, function (remP) { return remP.pid == child.pid } );
			}
		}
	}
	if(remPoems.length > 1){
		return links.concat(buildTree(_.sample(treePoems), remPoems, treePoems));
	} else {
		return links;
	}
}

var globalLinks = [];
_.forEach(ops, function (op, i, arr) {
	var treePoems = _.filter(indexData, function (v) { return v.orig_src == op.pid });
	var treeLinks = buildTree(op, treePoems, treePoems);
	
	globalLinks = globalLinks.concat(treeLinks);
});

fs.writeFileSync("./links_test.json", JSON.stringify(globalLinks));

//BUILD POEMS DATABASE ========================================================================================

var poems = [];

var sampleText = "Lorem ipsum dolor sit amet,\nconsectetur adipiscing elit.\nMaecenas tempus semper odio,\nvel rutrum sem consectetur eu.\nAenean at nibh ut eros iaculis aliquam.\nDuis posuere\nlacus sed sodales\ndapibus.\nPraesent nunc neque, ornare sit amet\ntincidunt ut, aliquam ac ex. Vestibulum\nvestibulum hendrerit gravida.\nVivamus dapibus lacus eros, eu\nmalesuada urna auctor sit amet. Cras mollis,\nante ac congue dapibus, tortor nibh\nmalesuada ex, volutpat imperdiet purus\njusto a magna.\nVestibulum auctor ex in\nnisi imperdiet aliquam. Donec\nut odio at urna congue commodo.\nVivamus commodo ex varius nibh interdum\nac mattis elit mattis. Pellentesque ut\npellentesque felis, non posuere nisi.\nDonec eu massa sapien. Sed posuere commodo\ntincidunt. Cras non turpis sapien. Duis\njusto nulla, maximus vitae nulla eget,\npretium fringilla risus. Aliquam odio elit,\nauctor ut diam ut, luctus accumsan erat.";

function makeText (title) {
	return title +"\n"+ sampleText.substr(0, Math.floor(Math.random()*sampleText.length));
}

_.forEach(indexData, function (poem, index, arr) {
	var children = _.map(_.filter(globalLinks, function (l) { return l.source == poem.pid }), function (c) { return {pid: c.target} });
	poems.push({
			"pid": poem.pid, 
			"title": poem.title, 
			"text": makeText(poem.title), 
			"children": children, 
			"orig_src": poem.orig_src, 
			"poem_num": poem.orig_src == null ? Math.floor(Math.random()*1000) : null
		});
});

_.forEach(poems, function (poem) {
	var filename = "./poems/" + poem.pid + ".json";
	fs.writeFileSync(filename, JSON.stringify(poem));
});

//BUILD DISTANCES =============================================================================================

var dataArray = [];

_.forEach(indexData, function (outp, i, outarr) {
	dataArray.push([]);
	_.forEach(indexData, function (innp, j, innarr) {
			if(j == i){ //if setting dist between poem and itself, set to 0
				dataArray[i].push(0);
			} else if(dataArray[j] && dataArray[j].length == outarr.length){ //if setting dist previously set, use same dist
				dataArray[i].push(dataArray[j][i]);
			} else if(_.some(globalLinks, function (v) { // if setting dist between parent and child, use small dist
				return (v.source == i && v.target == j) || (v.source == j && v.target == i) 
				})) { 
				dataArray[i].push(Math.floor(Math.random()*75));
			} else { //if setting dist between otherwise unrelated nodes
				dataArray[i].push(Math.floor(Math.random()*1000)+500);
			}
	});
	console.log(i);
});
for(var i = 0; i != dataArray.length; i++){
	var out = { "pid" : i, "dists" : [] };
	for(var j = 0; j != dataArray[i].length; j++){
		out.dists.push( { "pid" : j, "val" : dataArray[i][j] } );
	}
	var filename = "./dists/" + i + ".json";
	fs.writeFileSync(filename, JSON.stringify(out));
}