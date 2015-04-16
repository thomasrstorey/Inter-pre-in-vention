(function(){
	exports.respond = function(req, res, testvar) {
		console.log(testvar);
		res.send([{
			id:1,
			message:'Hello World Works!!',
			type:'This is only for TEST Purpose'
		}]);
	};
})();