angular.module('ReaderCtrl', [])
	.controller('ReaderController',
		["$scope", "$http", "$routeParams", function ($scope, $http, $routeParams) {
			$scope.uid = $routeParams.uid;
			$scope.inpoem = "";
			$scope.outpoem = "";
			$http.get('/api/poem/'+$scope.uid)
				.success(function (data) {
					$scope.inpoem = data;
				})
				.error(function (data) {
					console.log("Error: " + data);
				});

			$scope.listen = function () {

			}

			//utility functions
			var toHTML = function(string){
				//cap with <p> and </p>
				//replace /n with </br>
			}
		}])
	.directive(
		"listener",
		[function () {
			return {
				link: function (scope, elem, attr) {
					//web-speech api code goes here
					//make two divs, one holds the inpoem, the other the outpoem
					var resultPoem;
				    var interimPoem;
				    document.addEventListener ("DOMContentLoaded", function(event) {
				    	resultPoem = document.getElementById("finalSpan");
				    	interimPoem = document.getElementById("interimSpan");
				    });

				    	if('webkitSpeechRecognition' in window){
				    		console.log("yay");
				    	} else {
				    		console.log("boo");
				    	}
				    	var recognition = new webkitSpeechRecognition();
				    	var finalTranscript;
				    	
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
				    			} else {
				    				interimTranscript += event.results[i][0].transcript;
				    			}
				    			
				    			resultPoem.innerHTML = linebreak(finalTranscript);
				    			interimPoem.innerHTML = linebreak(interimTranscript);
				    		}
				    	}

				    	recognition.onerror = function () {

				    	}

				    	recognition.onend = function () {

				    	}

				    	var startButton = function (event) {
				    		finalTranscript = '';
				    		recognition.lang = "en-US";
				    		recognition.start();
				    	}

				    	var two_line = /\n\n/g;
						var one_line = /\n/g;
						var linebreak = function (s) {
						  return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
						}
				}
			}
		}]);