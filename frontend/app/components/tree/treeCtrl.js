angular.module('TreeCtrl', [])
	.controller('TreeController', 
		["$scope", "$http", "$routeParams", "$location" function ($scope, $http, $routeParams, $location) {
			//get the master poems list from the api
			$scope.poemsList = [];
			$http.get('/api/poems_list/')
				.success(function (data) {
					$scope.poemsList = data;
				})
				.error(function (data) {
					console.log("Error: " + data);
				});
			$scope.nodes = _.map($scope.poemsList, function (val, key, arr) {
				return {pid: val.pid, title: val.title};
			});
			$scope.links = _.map($scope.poemsList, function (val, key, arr) {
				return _.reduce(val.children, function (array, child) {
					array.push({source: val.pid, target: child.pid, value: child.dist});
				}, []);
			});
			console.log($scope.links);
	}])	
	.directive(
		"treeCanvas",
		[function () { //factory function for tree-canvas directive
			return {
				link: function (scope, elem, attr) {
					
				}
			}
		}]);