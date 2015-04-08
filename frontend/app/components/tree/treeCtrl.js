angular.module('TreeCtrl', [])
	.controller('TreeController', 
		["$scope", "$http", "$routeParams", "$location", function ($scope, $http, $routeParams, $location) {
			//get the master poems list from the api
			$scope.poemsList = [];
			$scope.nodes = [];
			$scope.links = [];
			$scope.distsList = [];
			$scope.dists = [];
			$scope.currentTitle = "Choose a poem";
			$scope.currentpid = null;
			$scope.disable = true;
			//Format JSON for d3 Force
			$http.get('/api/poems_list/')
				.success(function (data) {
					$scope.poemsList = data;
					$scope.nodes = _.map($scope.poemsList, function (val, key, arr) {
						return {pid: val.pid, title: val.title, dist: null};
					});
					$scope.links = _.flatten(_.map($scope.poemsList, function (src) {
						return _.map(src.children, function (child) {
							return {source: src.pid, target: child.pid, value: child.dist, display: true};
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
				})
				.error(function (err) {
					console.log("Error: " + err);
				})

			$scope.setTitle = function (pid) {
				$http.get('api/poems/'+pid)
					.success(function (data) {
						$scope.currentTitle = data.title;
					})
					.error(function (err) {
						console.log("Error: " + err);
					})
			}

			$scope.readPoem = function () {
				$location.path("/reader/" + $scope.currentpid);
			}
			
	}])	
	.directive(
		"treeCanvas",
		[function () { //factory function for tree-canvas directive
			return {
				link: function (scope, elem, attr) {
					var l = scope.links.length;

					var zoom = d3.behavior.zoom()
							    .scaleExtent([-1, 10])
							    .on("zoom", zoomed);

					var width = elem[0].clientWidth,
						height = window.innerHeight-160;

					

					var force = d3.layout.force();

					var svg = d3.select("#tree-container").append("svg")
						.attr("width", width)
						.attr("height", height)
						.call(zoom);

					var container = svg.append("g")
					    .attr("width", width)
					    .attr("height", height)
					    .style("fill", "none");	
					  
					function resize () {
						var width = elem[0].clientWidth,
							height = window.innerHeight-160;
				    	svg
				    		.attr("width", width)
				    		.attr("height", height);
				    	container
				    		.attr("width", width)
				    		.attr("height", height);
				    }

				    window.onresize = resize; 

					var link = container.selectAll(".link");
					var node = container.selectAll(".node");

					scope.$watchGroup(['nodes','links'], function () {
						console.log(scope.links);
						update();
					}, true);
					
					
					node.append("title")
						.text(function (d) { return d.title });
					force.on("tick", function() {

					    link.attr("x1", function(d) { return d.source.x; })
					        .attr("y1", function(d) { return d.source.y; })
					        .attr("x2", function(d) { return d.target.x; })
					        .attr("y2", function(d) { return d.target.y; });

					    node.attr("cx", function(d) { return d.x; })
					        .attr("cy", function(d) { return d.y; });

				    });

					function zoomed() {
					  container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
					}

				    function update () {

				    	force
				    		.nodes(scope.nodes)
						    .links(scope.links)
						    .charge(-30)
						.chargeDistance(500)
						.gravity(0.1)
						.linkDistance(function (d) { return d.value })
						.linkStrength(function (d) { return d.display ? 0 : 1.0})
						.size([width, height])
						    .start();

						link = link.data(scope.links);
						link
							.enter().append("line")
							.attr("class", "link")
							.style("stroke-width", 1)
						    .style("stroke", "black");
						link
							.exit()
							.remove();
						
						node = node.data(scope.nodes)
							.enter().append("circle")
							.attr("class", "node")
							.attr("r", 5)
							.style("fill", "#000")
							.on("click", function (d) {
								console.log(scope.links);
								scope.setTitle(d.pid);
								scope.disable = false;
								scope.currentpid = d.pid;
								_.remove(scope.links, function (l) { return l.display == false });
								console.log(scope.links);
								_.each(_.map(scope.distsList[d.pid].dists, function (link) {
									return {source: d.pid, target: link.pid, value: link.val, display: false};
								}), function (link) {
									scope.links.push(link);
								});

								console.log(scope.links);
								scope.$apply();
								node.each(function (ed) {
									ed.dist = scope.distsList[d.pid].dists[ed.pid].val;
									if(ed.fixed){
										ed.fixed = false;
								    }
								});
								d.fixed = true;
								d.px = width/2;
								d.py = height/2;
								d.x = width/2;
								d.y = height/2;
								force.start();
							});
				    }


				    update();
				}
			}
		}])
	.directive("treeSidebar", 
		[function () {
			return {
				link : function () {

				} 
			}
		}]);