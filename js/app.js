var glCards = [];

// Declare app level module which depends on views, and components
var app = angular.module('redLion', ['ngRoute']);
//
app.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/grid', {
        template: '<h1>HELLO ITS WORKING!!!!!</h1>',
        controller: 'GridControler'
      }).
      when('/work/:campaignID/:subSection', {
        templateUrl: 'templates/work.html',
        controller: 'WorkCtrl'
      }).
      otherwise({
        redirectTo: '/grid'
      });
  }]);
//
app.controller('CardTestController', function ($scope, Cards, filterFilter) {
	$scope.cards = Cards.get();
	init3D();
});
//
app.controller('GridControler', function ($scope) {
	console.log("grid connection");
});
//
app.controller('WorkCtrl', ['$scope', '$routeParams',
  function($scope, $routeParams) {
    $scope.campaignID = $routeParams.campaignID;
    $scope.startSection = $routeParams.subSection;
    console.log("Campaign ID = " + $scope.campaignID);
    console.log("subSection = " + $scope.startSection);
  }]);
//
app.factory('Cards', function ($http) {
	var cards = [];

	return {
		get: function () {
			if (cards.length === 0) {
				$http.get('http://redlioncanada.com/api/content/')
					.success(function (response) {
						for (var i = 0, ii = response.length; i < ii; i++) {
							cards.push(response[i]);
						}
					})
					.error(function (err) {
						alert('ERROR: ' + err);
					});
			}
			glCards = cards;
			return cards;
		}
	};
});

/*
app.directive('overlayItem', function ($compile) {
	var workTemplate = 'templates/work.html';
	var peopleTemplate = 'templates/people.html';
	var clientTemplate = 'templates/client.html';
	var newsTemplate = 'templates/news.html';
	
	var getTemplate = function(contentType) {
		var template = null;
		
		switch (contentType) {
			case 'work':
				template = workTemplate;
			break;
			case 'people':
				template = peopleTemplate;
			break;
			case 'client':
				template = clientTemplate;
			break;
			case 'news':
				template = newsTemplate;
			break;
		}
	}
	
	var linker = function(scope, element, attrs) {
		element.html()
	}
	
	return {
		restrict: "E",
		link: linker,
		scope: {
			content:"="
		}
	};
});
*/