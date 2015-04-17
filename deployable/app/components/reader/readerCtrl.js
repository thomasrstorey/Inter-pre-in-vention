angular.module('ReaderCtrl', [])
	.controller('ReaderController',
		["$scope", "$http", "$routeParams", "$location", function ($scope, $http, $routeParams, $location) {
			$scope.pid = $routeParams.pid;
			$scope.inpoem = "";
			$scope.formattedStart = "";
			$scope.outpoem = "";
			$http.get('/api/poem?pid='+$scope.pid)
				.success(function (data) {
					$scope.inpoem = data.text;
					$scope.formattedStart = toHTML(data.text);
				})
				.error(function (data) {
					console.log("Error: " + data.Error);
				});

			$scope.result = "";
			$scope.interim = "";
			$scope.formattedResult = "";
			$scope.listening = false;
			$scope.toggleicon = "fa fa-microphone";
			$scope.togglemsg = 'Listen';
			$scope.disable = true;
			$scope.title = "";

			$scope.format = function (string) {
				$scope.formattedResult = toHTML(string);
			}

			$scope.addPoem = function () {
				$http.post('/api/new_poem', {pid: $scope.pid, title: $scope.title, poem: $scope.result})
					.success(function (data, status) {
						console.log("poem sent");
						//TO DO: Complete progress bar
					})
					.error(function (data, status) {
						console.log("error while sending new poem");
						$location.path('/tree/');
					});
				//TO DO: Start progress bar from service
				$location.path('/tree/');
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
			    			    scope.title = scope.result.split('\n')[0];
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
									scope.togglemsg = 'Listen';
									scope.toggleicon = "fa fa-microphone";
									scope.listening = false;
									scope.disable = false;
								});
				    			recognition.stop();
				    			return;
				    		}
				    	scope.$apply(function () {
							scope.listening = true;
							scope.toggleicon = 'fa fa-microphone-slash';
			    		    scope.togglemsg = 'Stop listening';
			    		    scope.disable = true;
						});
			    		recognition.lang = "en-US";
			    		recognition.start();
					});
				}
			}
		}]);