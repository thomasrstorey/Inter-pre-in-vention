exports.respond = function(req,res) {
	res.send([{
		id:1,
		message:'Hello World!!',
		type:'This is only for TEST Purpose'
	}]);
};