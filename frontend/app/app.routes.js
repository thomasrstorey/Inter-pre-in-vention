angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider', 
	function($routeProvider, $locationProvider) {
		$routeProvider
			.when('/tree/:uid', {
				templateUrl: 'app/components/tree/treeView.html',
				controller: 'TreeController'
			})
			.when('/', {
				templateUrl: 'app/components/home/homeView.html',
				controller: 'HomeController'
			});
			$locationProvider.html5Mode(true);
	}]);