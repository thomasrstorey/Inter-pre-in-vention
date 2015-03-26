angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider', 
	function($routeProvider, $locationProvider) {
		$routeProvider
			.when('/tree/:uid', {
				templateUrl: 'app/components/tree/treeView.html',
				controller: 'TreeController'
			})
			.when('/reader/:uid', {
				templateUrl: 'app/components/reader/readerView.html',
				controller: 'ReaderController'
			})
			.when('/', {
				templateUrl: 'app/components/home/homeView.html',
				controller: 'HomeController'
			});
			$locationProvider.html5Mode(true);
	}]);