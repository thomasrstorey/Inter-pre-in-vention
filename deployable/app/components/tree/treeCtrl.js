angular.module('TreeCtrl', [])
	.controller('TreeController', 
		["$scope", "$http", "$routeParams", "$location", function ($scope, $http, $routeParams, $location) {
			//declare global scope
			$scope.nodes = [];
			$scope.links = [];
			$scope.dists = [];
			$scope.lineage = [];
			$scope.currentTitle = "Choose a poem";
			$scope.currentpid = 0;
			$scope.disable = true;

			//called when user insteraction should change what data is visualized
			//get the nodes, links, dists and lineage relative to the currently selected pid
			$scope.updateDisplay = function (pid){
				$http.get('/api/display/?pid='+pid)
				.success(function (data) {
					$scope.nodes = data.poem_objects;
					//filter links to use only those that are in the tree of the currently selected node
					//reformat for d3
					//source and target as indices into the nodes array, but are later replaced with references
					$scope.links = _.map(_.filter(data.object_connections, function (l, i) {
						return $scope.nodes[pid].orig_src === $scope.nodes[l.source_index].orig_src;
					}), function (l) {
						return {source: l.source_index, target: l.target_index, value: 20, display: true};
					});
					$scope.dists = data.object_distances;
					$scope.lineage = data.object_lineage;

					//remove old invisible links
					_.remove($scope.links, function (l) { return l.display == false });
					//create new invisible links 
					//(used to space nodes according to levenshtein distance)
					_.each(_.map($scope.dists, function (link) {
						return {source: pid, target: link.pid, value: link.distance, display: false};
					}), function (link) {
						$scope.links.push(link);
					});			
				})
				.error(function (data) {
					console.log("Error: " + data);
				});
			}

			//sets the displayed title to that of the currently selected pid
			$scope.setTitle = function (pid) {
				$scope.currentTitle = $scope.nodes[pid].title;
			}

			//change location to the reader view
			$scope.readPoem = function () {
				$location.path("/reader/" + $scope.currentpid);
			}

			//initialize with default poem selected
			$scope.updateDisplay($scope.currentpid);
			
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

					scope.$watchGroup(['nodes','links', 'dists', 'lineage'], function () {
						if(scope.nodes.length > 0 && scope.links.length > 0)
							update();
					}, true);
					
					node.append("title")
						.text(function (d) { return d.title });
					force.on("tick", function() {
						force.alpha(0.01);
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

					function inLineage (d) {
						//TO DO: Use lineage object to determine if a given
						//link object is in lineage.
						return _.some(scope.lineage, function (l) {
							return l.parent === d.source.index && l.child === d.target.index;
						});
					}

				    function update () {
				    	force
				    		.nodes(scope.nodes)
						    .links(scope.links)
						    .charge(-100)
							.gravity(0.1)
							.linkDistance(function (d) { return d.value })
							.linkStrength(function (d) { return d.display ? 0.5 : 1.0})
							.size([width, height])
						    .start();

						link = link.data(scope.links);
						link
							.enter().append("line")
							.attr("class", "link")
							.style("stroke-width", function (d) { 
								return inLineage(d) ? 5 : 2; 
							})
						    .style("stroke", "black")
						    .attr("visibility", function (d) { return d.display ? "visible" : "hidden"});
						link
							.exit()
							.remove();
						
						node = node.data(scope.nodes);
						node
							.enter().append("circle")
							.attr("class", "node")
							.attr("r", function (d) { return d.orig_src === d.pid ? 8 : 4 })
							.style("fill", "#000")
							.on("click", function (d) {
								scope.setTitle(d.pid);
								scope.updateDisplay(d.pid);
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