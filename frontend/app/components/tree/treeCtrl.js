angular.module('TreeCtrl', []).controller('TreeController', 
	function ($scope) {
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
	});