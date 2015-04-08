angular.module('ReaderCtrl', [])
	.controller('ReaderController',
		["$scope", "$http", "$routeParams", "$location", function ($scope, $http, $routeParams, $location) {
			$scope.pid = $routeParams.pid;
			$scope.inpoem = "";
			$scope.formattedStart = "";
			$scope.outpoem = "";
			$http.get('/api/poems/'+$scope.pid)
				.success(function (data) {
					$scope.inpoem = data.text;
					$scope.formattedStart = toHTML(data.text);
				})
				.error(function (data) {
					console.log("Error: " + data);
				});

			$scope.result = "";
			$scope.interim = "";
			$scope.formattedResult = "";
			$scope.listening = false;
			$scope.togglemsg = "listen";
			$scope.disable = true;

			$scope.format = function (string) {
				$scope.formattedResult = toHTML(string);
			}

			$scope.addPoem = function () {
				$http.post('/api/poems/add', {poem: $scope.result})
					.success(function (data, status) {
						console.log("poem sent");
						$location.path('/');
					})
					.error(function (data, status) {
						console.log("error while sending new poem");
						$location.path('/');
					});
			};

			$scope.backToTree = function () {
				$location.path("/tree/");
			};

			//utility functions============================
			var toHTML = function(string){
				//cap with <p> and </p>
				//replace /n with </br>
				var lines = string.split("\n");
				var formattedLines = [];
				lines.forEach(function (v, i, arr){
					formattedLines.push("<p>"+v+"</p>");
				});
				return formattedLines.join("\n");
			}



		}])
	.directive(
		"listener",
		[function () {
			return {
				link: function (scope, elem, attr) {

					//web speech api, recognition ===================================
			    	if('webkitSpeechRecognition' in window){
			    		console.log("yay");
			    	} else {
			    		console.log("boo");
			    	}

			    	var recognition = new webkitSpeechRecognition();
			    	var finalTranscript = "";
			    	var toid;
		    		recognition.continuous = true;
		    		recognition.interimResults = true;



			    	recognition.onstart = function () {
			    		
						console.log("start");
			    	}

			    	recognition.onresult = function (event) {
			    		
			    		var interimTranscript = '';
			    		console.log("result");
			    		for(var i = event.resultIndex; i < event.results.length; ++i){
			    			if(event.results[i].isFinal) {
			    				finalTranscript += event.results[i][0].transcript;
			    				//pause timeout
					    		if(toid){
					    			window.clearTimeout(toid);
					    		}
					    		toid = window.setTimeout(function () {
					    			finalTranscript += "\n"; //add new line after 1 second pause
					    		}, 10);
			    			} else {
			    				interimTranscript += event.results[i][0].transcript;
			    			}

			    			scope.$apply(function () {
			    				scope.result = finalTranscript;
			    			    scope.interim = interimTranscript;
			    			    scope.format(scope.result + scope.interim);
			    			});
			    		}
			    	}

			    	recognition.onerror = function (e) {
			    		console.log(e.error);
			    	}

			    	recognition.onend = function () {
			    		console.log("end");
			    	}

			    	elem.bind ("click", function () {
						if(scope.listening){
								scope.$apply(function () {
									scope.togglemsg = "Listen";
									scope.listening = false;
									scope.disable = false;
								});
				    			recognition.stop();
				    			return;
				    		}
				    	scope.$apply(function () {
							scope.listening = true;
			    		    scope.togglemsg = "Stop listening";
			    		    scope.disable = true;
						});
			    		recognition.lang = "en-US";
			    		recognition.start();
					});
				}
			}
		}]);