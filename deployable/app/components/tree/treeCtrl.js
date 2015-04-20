angular.module('TreeCtrl', [])
	.controller('TreeController', 
		["$scope", "$rootScope", "$http", "$routeParams", "$location", function ($scope, $rootScope, $http, $routeParams, $location) {
			//declare global scope
			$scope.nodes = [];
			$scope.links = [];
			$scope.dists = [];
			$scope.lineage = [];
			$scope.currentTitle = "Choose a poem";
			$rootScope.currentpid = 5;
			$scope.disable = true;
			$scope.unwatchGroup;
			$scope.currentFilter = -1;
			$scope.filters = [{name: "Engagement, Participation, Interaction", type: 0},
							  {name: "Potential, Production, Transformation", type: 1},
							  {name: "Dynamism, Unfolding Landscapes, Evolving Frontiers", type: 2},
							  {name: "Textual Relationships, Likenesses, Betrayals", type: 3},
							  {name: "Famous Works", type: 4},
							  {name: "All", type: 5}];

			//called when user insteraction should change what data is visualized
			//get the nodes, links, dists and lineage relative to the currently selected pid
			$rootScope.updateDisplay = function (pid){
				$http.get('/api/display/?pid='+pid)
				.success(function (data) {
					//set all nodes to start on screen
					$scope.nodes = data.poem_objects
					//$scope.nodes = data.poem_objects;
					
					$scope.dists = data.object_distances;
					$scope.updateLinks(pid, data.object_connections);

					$scope.lineage = data.object_lineage;
			
				})
				.error(function (data) {
					console.log("Error: " + data);
				});
			}

			$scope.getDists = function (pid){
				$http.get('/api/display/?pid='+pid)
				.success(function (data) {
					$scope.dists = data.object_distances;
				})
				.error(function (data) {
					console.log("Error: " + data);
				});
			}

			$scope.getBGLinks = function (pid){
				//remove old invisible links
				_.remove($scope.links, function (l) { return l.display == false });
				//create new invisible links 
				//(used to space nodes according to levenshtein distance)
				_.each(_.map($scope.dists, function (link) {
					return {source: pid, target: link.pid, value: link.distance, display: false};
				}), function (link) {
					$scope.links.push(link);
				});
			}

			$scope.updateLinks = function (pid, data) {
				//filter links to use only those that are in the tree of the currently selected node
				//reformat for d3
				//source and target as indices into the nodes array, but are later replaced with references
				$scope.links = _.map(_.filter(data, function (l, i) {
					return $scope.nodes[pid].orig_src === $scope.nodes[l.source_index].orig_src;
				}), function (l) {
					return {source: l.source_index, target: l.target_index, value: 20, display: true};
				});
				//remove old invisible links
				_.remove($scope.links, function (l) { return l.display == false });
				//create new invisible links 
				//(used to space nodes according to levenshtein distance)
				_.each(_.map($scope.dists, function (link) {
					return {source: pid, target: link.pid, value: link.distance, display: false};
				}), function (link) {
					$scope.links.push(link);
				});
			}

			//sets the displayed title to that of the currently selected pid
			$scope.setTitle = function (pid) {
				$scope.currentTitle = $scope.nodes[pid].title;
			}

			//change location to the reader view
			$scope.readPoem = function () {
				//discard d3 simulation
				$location.path("/reader/" + $rootScope.currentpid);
			}

			$scope.$on('$routeChangeStart', function (event, next, current){
				
				if(typeof current !== undefined){
					console.log('change!');
					$scope.unwatchGroup();
					$scope.nodes = null;
					$scope.links = null;
					$scope.dists = null;
					$scope.lineage = null;
					d3.selectAll('.node').remove();
					d3.selectAll('.link').remove();
					d3.select('#tree-container').remove();
					window.onresize = null;
				}
				
			});

			//initialize with default poem selected
			$rootScope.updateDisplay($rootScope.currentpid);
			
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

					var nodes = scope.nodes.slice();
					var links = scope.links.slice();

					scope.unwatchGroup = scope.$watchGroup(['nodes','links', 'dists', 'lineage'], function () {
						if(scope.nodes.length > 0 && scope.links.length > 0)
							update();
					}, true);
					
					node.append("title")
						.text(function (d) { return d.title });
					force.on("tick", function() {
						var a = force.alpha() > 0.01 ? force.alpha() : 0.01;
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

					scope.filterPoems = function (type) {
						scope.currentFilter = type;
						if(type >= 0){
							nodes = _.filter(scope.nodes, function (n){
								return n.category === type;
							});
							if(!_.some(nodes, function (n) {return scope.$parent.currentpid === n.pid}) ) {
								scope.$parent.currentpid = _.sample(nodes).pid;
								var d = node.filter(function (d) {return d.pid === scope.$parent.currentpid});
								selectPoem(d[0][0].__data__);
							}
							scope.getDists(scope.$parent.currentpid);
							scope.getBGLinks(scope.$parent.currentpid);
							links = _.filter(scope.links, function (l){
								return _.some(scope.nodes, function (n) { 
									return (l.source === n.pid || l.target === n.pid);
								});
							});

						} else {
							nodes = scope.nodes.slice();
							links = scope.links.slice();
						}
					}

					function selectPoem (d) {
						scope.setTitle(d.pid);
						scope.getDists(d.pid);
						scope.getBGLinks(d.pid);
						scope.disable = false;
						scope.$parent.currentpid = d.pid;
						//scope.$apply();
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
						node.filter(function (e) { return e.pid === d.pid })
							.attr("r", 8)
							.style("fill", "#f66")
							.on("mouseover", function (d) {
								
							})
							.on("mouseout", function (d) {
								
							});
					}

				    function update () {
				    	scope.filterPoems(scope.currentFilter);
				    	nodes = _.map(nodes, function (po, i) {
				    		var x, y, fixed;
				    		if(po.pid === scope.$parent.currentpid){
				    			x = width/2;
				    			y = height/2;
				    			fixed = true;
				    		} else {
				    			x = width/2 + Math.cos(i*0.1)*200;
				    			y = height/2 + Math.sin(i*0.1)*200;
				    			fixed = false;
				    		}
							return _.assign(po, {x:x}, {y:y}, {px:x}, {py:y}, {fixed: fixed}, {category: Math.floor(Math.random()*5)});
						});
				    	force
				    		.nodes(nodes)
						    .links(links)
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
						
						node = node.data(nodes);
						node
							.enter().append("circle")
							.attr("class", "node")
							.attr("r", function (d) { return d.orig_src === d.pid ? 8 : 4 })
							.style("fill", "#000")
							.on("click", function (d) {selectPoem(d)})
							.on("mouseover", function (d) {
								d3.select(this).attr("r", 8)
								  .style("fill", "#a55");
							})
							.on("mouseout", function (d) {
								d3.select(this).attr("r", 4)
								  .style("fill", "#000");
							})
							.call(drag);
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