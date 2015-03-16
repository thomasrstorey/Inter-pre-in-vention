angular.module('app.routes', []).config(['$routeProvider', '$locationProvider', 
	function($routeProvider, $locationProvider) {
		$routeProvider
			.when('/', {
				templateUrl: 'home/homeView.html',
				controller: 'HomeController'
			})
			.when('/tree*', {
				templateUrl: 'tree/treeView.html',
				controller: 'TreeController'
			});
			$locationProvider.html5Mode(true);
	}]);