angular.module('HomeCtrl', [])
.controller('HomeController', ["$scope", "$location", function ($scope, $location) {
		$scope.goToTree = function () {
			$location.path('/tree/');
		};
		

	}]);