angular.module('TreeCtrl', [])
	.controller('TreeController', 
		["$scope", "$http", "$routeParams", "$location", function ($scope, $http, $routeParams, $location) {
			//get the master poems list from the api
			$scope.nodes = [];
			$scope.links = [];
			$scope.dists = [];
			$scope.currentTitle = "Choose a poem";
			$scope.currentpid = null;
			$scope.disable = true;
			//Format JSON for d3 Force
			$http.get('/api/poems_list/')
				.success(function (data) {
					$scope.nodes = data;			
				})
				.error(function (data) {
					console.log("Error: " + data);
				});
			$http.get('/api/links_list')
				.success(function (data) {
					$scope.links = _.map(data, function (o) {
						return {
							source: o.source,
							target: o.target,
							value: o.value,
							display: true
						};
					});	
				})
				.error(function (data) {
					console.log("Error: " + data);
				});
			

			$scope.getDists = function (pid) { //get precomputed levenshtein distances for a selected node
				$http.get('/api/dists/'+pid)
				.success(function (obj) {
					$scope.dists = obj.dists;
					_.remove($scope.links, function (l) { return l.display == false });
					_.each(_.map($scope.dists, function (link) {
						return {source: pid, target: link.pid, value: link.val, display: false};
					}), function (link) {
						$scope.links.push(link);
					});
				})
				.error(function (err) {
					console.log("Error: " + err);
				});
			}

			$scope.setTitle = function (pid) {
				$scope.currentTitle = $scope.nodes[pid].title;
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

					var drag = d3.behavior.drag()
			            .origin(function(d) { return d; })
			            .on("dragstart", dragstarted)
			            .on("drag", dragged)
			            .on("dragend", dragended);

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

					scope.$watchGroup(['nodes','links', 'dists'], function () {
						if(scope.nodes.length > 0 && scope.links.length > 0)
							update();
					}, true);
					
					node.append("title")
						.text(function (d) { return d.title });
					force.on("tick", function() {
						force.alpha(0.1);
					    link.attr("x1", function(d) { return d.source.x; })
					        .attr("y1", function(d) { return d.source.y; })
					        .attr("x2", function(d) { return d.target.x; })
					        .attr("y2", function(d) { return d.target.y; });

					    node.attr("cx", function(d) { return d.x; })
					        .attr("cy", function(d) { return d.y; });

				    });

					function zoomed () {
					  container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
					}

					function dragstarted(d) {
			          d3.event.sourceEvent.stopPropagation();
			          
			          d3.select(this).classed("dragging", true);
			          force.start();
			        }

			        function dragged(d) {
			          
			          d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
			          
			        }

			        function dragended(d) {
			          
			          d3.select(this).classed("dragging", false);
			        }

					function generation (d, count) {
						count = count || 1;
						var upOne = {};
						if(_.some(scope.links, function (l) {
							if(l.target.index === d.source.index && l.display === true){
								upOne = l;
								return true;
							}
							return false;
						})){
							return generation(upOne, count + 1);
						} else {
							return count;
						}
					}

				    function update () {
				    	force
				    		.nodes(scope.nodes)
						    .links(scope.links)
						    .charge(-100)
							.gravity(0.1)
							.linkDistance(function (d) { return d.value })
							.linkStrength(function (d) { return d.display ? 1.0 : 1.0})
							.size([width, height])
						    .start();

						link = link.data(scope.links);
						link
							.enter().append("line")
							.attr("class", "link")
							.style("stroke-width", function (d) { return 5/generation(d) })
						    .style("stroke", "black")
						    .attr("visibility", function (d) { return d.display ? "visible" : "hidden"});
						link
							.exit()
							.remove();
						
						node = node.data(scope.nodes);
						node
							.enter().append("circle")
							.attr("class", "node")
							.attr("r", function (d) { return d.orig_src === null ? 8 : 4 })
							.style("fill", "#000")
							.on("click", function (d) {
								scope.setTitle(d.pid);
								scope.getDists(d.pid);
								scope.disable = false;
								scope.currentpid = d.pid;
								scope.$apply();
								node.each(function (ed) {
									d3.select(this)
									.attr("r", 4)
									.style("fill", "#000")
									.on("mouseover", function (d) {
										d3.select(this).attr("r", 8)
								  		  .style("fill", "#a55");
									})
									.on("mouseout", function (d) {
										d3.select(this).attr("r", 4)
								  		  .style("fill", "#000");
									});

									if(ed.fixed){
										ed.fixed = false;
								    }
								});


								d3.select(this)
									.attr("r", 8)
									.style("fill", "#f66")
									.on("mouseover", function (d) {
										
									})
									.on("mouseout", function (d) {
										
									});
								d.fixed = true;
								d.px = width/2;
								d.py = height/2;
								d.x = width/2;
								d.y = height/2;
								force.start();
							})
							.on("mouseover", function (d) {
								d3.select(this).attr("r", 8)
								  .style("fill", "#a55");
							})
							.on("mouseout", function (d) {
								d3.select(this).attr("r", 4)
								  .style("fill", "#000");
							})
							.call(drag);;
						node
							.exit()
							.remove();

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