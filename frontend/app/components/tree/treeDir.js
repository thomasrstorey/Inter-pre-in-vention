angular.module("TreeCanvasDir", [])
	.directive(
		"TreeCanvasDirective",
		[function () {
			return {
				restrict: "E",
				transclude: true,
				link: function (scope, elem, attr) {
					//threejs stuff happens here, with access to scope!
					var camera, scene, renderer, raycaster;

					var mouse = new THREE.Vector2();

					var currInterx;

					var tree = scope.tree;

					init();

					function init () {

						camera = new THREE.PerspectiveCamera(35, window.innerWidth/window.innerHeight, 1, 10000 );
						scene = new THREE.Scene();

						console.log(tree.origin.title);

						
					}
				}
			}
		}]);