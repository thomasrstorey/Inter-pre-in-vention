angular.module('HomeCtrl', []).controller('HomeController', 
	function ($scope) {
		//for demo purposes only - hardcoded poem list values
		$scope.poems = [
					{
						title: "first poem",
						uid: 1
					},
					{
						title: "second poem",
						uid: 2
					},
					{
						title: "third poem",
						uid: 3
					},
					{
						title: "fourth poem",
						uid: 4
					}
			];
	});