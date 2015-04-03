angular.module('TreeCtrl', [])
	.controller('TreeController', 
		["$scope", "$http", "$routeParams", "$location", function ($scope, $http, $routeParams, $location) {
			//get the master poems list from the api
			$scope.poemsList = [];
			$scope.nodes = [];
			$scope.links = [];
			$scope.distsList = [];
			//Format JSON for d3 Force
			$http.get('/api/poems_list/')
				.success(function (data) {
					$scope.poemsList = data;
					$scope.nodes = _.map($scope.poemsList, function (val, key, arr) {
						return {pid: val.pid, title: val.title};
					});
					$scope.links = _.flatten(_.map($scope.poemsList, function (src) {
						return _.map(src.children, function (child) {
							return {source: src.pid, target: child.pid, value: child.dist};
						});
					}));				
				})
				.error(function (data) {
					console.log("Error: " + data);
				});
			//Get precomputed Levenshtein distances from each node to all other nodes.
			$http.get('/api/dists_list')
				.success(function (obj) {
					$scope.distsList = obj.data;
					console.log($scope.distsList);
				})
				.error(function (err) {
					console.log("Error: " + err);
				})
			
	}])	
	.directive(
		"treeCanvas",
		[function () { //factory function for tree-canvas directive
			return {
				link: function (scope, elem, attr) {
					var l = scope.nodes.length;
					var width = window.innerWidth,
						height = window.innerHeight;
					var force = d3.layout.force()
						.charge(-30)
						.gravity(0.1)
						.linkDistance(function (d) { return d.value })
						.size([width, height]);
					var svg = d3.select("body").append("svg")
						.attr("width", width)
						.attr("height", height);
					var link = svg.selectAll(".link");
					var node = svg.selectAll(".node");

					node.append("title")
						.text(function (d) { return d.title });
					force.on("tick", function() {
						if(scope.nodes.length != l){
							l = scope.nodes.length;
							update();
						}
					    link.attr("x1", function(d) { return d.source.x; })
					        .attr("y1", function(d) { return d.source.y; })
					        .attr("x2", function(d) { return d.target.x; })
					        .attr("y2", function(d) { return d.target.y; });

					    node.attr("cx", function(d) { return d.x; })
					        .attr("cy", function(d) { return d.y; });
				    });

				    function update () {

				    	force
				    		.nodes(scope.nodes)
						    .links(scope.links)
						    .start();

						link = link.data(scope.links)
							.enter().append("line")
							.attr("class", "link")
							.style("stroke-width", 1)
						    .style("stroke", "black");

						node = node.data(scope.nodes)
							.enter().append("circle")
							.attr("class", "node")
							.attr("r", 5)
							.style("fill", "#000")
							.on("click", function (d) {
								node.each(function (d) {
									if(d.fixed){
										d.fixed = false;
								    }
								});
								d.fixed = true;
								d.px = width/2;
								d.py = height/2;
								d.x = width/2;
								d.y = height/2;
								force.resume();
								console.log("x: " + d.x);
								console.log("y: " + d.y);
							});
				    }
				    update();
				}
			}
		}]);