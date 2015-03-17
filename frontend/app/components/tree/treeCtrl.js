angular.module('TreeCtrl', [])
	.controller('TreeController', 
		["$scope", function ($scope) {
			//for demo purposes only, hardcoded tree values to simulate db response
			$scope.tree = {
				origin : {
					title: "origin poem",
					uid: 1,
					children: [
						{
							title: "first gen child one",
							uid: 2,
							children: []
						},
						{
							title: "first gen child two",
							uid: 3,
							children: [
								{
									title: "second gen child one",
									uid: 5,
									children:[]
								},
								{
									title: "second gen child two",
									uid: 6,
									children:[
										{
											title: "third gen child one",
											uid: 7,
											children:[]
										}
									]
								},
							]
						},
						{
							title: "first gen child three",
							uid: 4,
							children: [
								{
									title: "second gen child three",
									uid: 8,
									children:[]
								}
							]
						},
					]
				}
			};
		}])
	.directive(
		"treeCanvas",
		[function () { //factory function for tree-canvas directive
			return {
				link: function (scope, elem, attr) {
					//threejs stuff happens here, with access to scope!
					var camera, scene, renderer, raycaster;

					var mouse = new THREE.Vector2();

					var currInterx;

					var container = document.getElementById("tree-container");

					var theta = 0.0;
					var radius = 100;

					var tree = scope.tree;

					init();
					animate();

					function init () {

						camera = new THREE.PerspectiveCamera(20, container.offsetWidth/(container.offsetWidth/2), 1, 10000 );
						scene = new THREE.Scene();

						//build nodes and lines from tree object

						buildTree(tree.origin);

						renderer = new THREE.WebGLRenderer({antialias: true});
						renderer.setClearColor(0xeeeeee);
						renderer.setPixelRatio(window.devicePixelRatio);
						renderer.setSize(container.offsetWidth, (container.offsetWidth/2));
						elem[0].appendChild(renderer.domElement);

						window.addEventListener('resize', onWindowResize, false);
					}

					function buildTree (tree, parent) {
						var geo = new THREE.SphereGeometry( 0.2 );
						var lgeo = new THREE.Geometry();
						var mat = new THREE.MeshBasicMaterial( { color: 0x555555 });
						var lmat = new THREE.LineBasicMaterial({ color: 0x555555 });
						var node = new THREE.Mesh(geo, mat);
						//add node to scene
						scene.add(node);
						if(parent){
							var dir = new THREE.Vector3(Math.random()-0.5, 
														Math.random()-0.5,
														Math.random()-0.5);
							var mag = (Math.random() * 40) + 5;
							var pos = new THREE.Vector3();
							pos.addVectors(parent, dir.multiplyScalar(mag));
							node.position.copy(pos);
							//add line from parent to node to scene
							lgeo.vertices.push( parent, pos );
							var line = new THREE.Line(lgeo, lmat);
							scene.add(line);
						} else {
							node.position = new THREE.Vector3(0, 0, 0);
						}
						

						//if children, recursively call buildTree
						if(tree.children.length > 0){
							tree.children.forEach(function (child) {
								buildTree(child, node.position);
							});
						}
					}

					function onWindowResize () {
						camera.aspect = container.offsetWidth/(container.offsetWidth/2);
						camera.updateProjectionMatrix();
						renderer.setSize(container.offsetWidth, (container.offsetWidth/2));
					}

					function animate () {
						requestAnimationFrame( animate );
						render();
					}

					function render () {
						theta += 0.1;
						camera.position.x = radius * Math.sin( THREE.Math.degToRad( theta ) );
						//camera.position.y = radius * Math.sin( THREE.Math.degToRad( theta ) );
						camera.position.z = radius * Math.cos( THREE.Math.degToRad( theta ) );
						camera.lookAt(scene.position);
						renderer.render(scene, camera);
					}
				}
			}
		}]);