var fs = require('fs');
var _ = require('lodash');
var Store = require('jfs');
var db = new Store("./distdb_test.json", {pretty: true});

var dataArray = [];
for(var i = 0; i != 35; i++){
	dataArray.push([]);
	for(var j = 0; j != 35; j++){
		if(j == i){
			dataArray[i].push(0);
			continue;
		}
		if(dataArray[j] && dataArray[j].length == 35){
			dataArray[i].push(dataArray[j][i]);
			continue;
		}
		dataArray[i].push(Math.floor(Math.random()*1000));
	}
}
var out = [];
for(var i = 0; i != dataArray.length; i++){
	out.push( { "pid" : i, "dists" : [] } );
	for(var j = 0; j != dataArray[i].length; j++){
		out[i].dists.push( { "pid" : j, "val" : dataArray[i][j] } );
	}
}
db.save(out, function (err, id){
	if(err) console.log(err);
	console.log("saved");
})