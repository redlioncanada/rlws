var glCards = [];

// Declare app level module which depends on views, and components
var app = angular.module('redLion', ['ngRoute']);
//
app.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/grid', {
		template: '<h1>HELLO ITS WORKING!!!!!</h1>',
		controller: 'GridControler'
	}).
	when('/work/:campaignID/:subSection', {
		templateUrl: 'templates/work.html',
		controller: 'WorkCtrl'
	}).
	when('/people/:staffID', {
		templateUrl: 'templates/people.html',
		controller: 'PeopleCtrl'
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
	}
]);
  
app.controller('PeopleCtrl', ['$scope', '$routeParams', 'People', 'Person', '$filter',
	function($scope, $routeParams, People, Person, $filter) {
		$scope.people = People.get();
		$scope.selperson = Person.get($routeParams.staffID);
		console.log("Person Slug = " +$routeParams.staffID);
	}
]);

app.directive('peopleImage', function() {
	return function(scope, element, attrs) {
		var img = "img/staff/" + attrs.peopleImage + "-" + attrs.type + ".jpg";
		element.attr("src", img);
	};
});

app.filter('getPersonBySlug', function() {
	return function(input, slug) {
		for (var i=0; i<input.length; i++) {
			console.log(input[i]);
			if (input[i].slug == slug) {
				return input[i];
			}
		}
		return 'oops';
	};
});

app.factory("Person", function($http) {
	var person = null;
	
	return {
		get: function(slug) {
			if (person === null) {
				$http.get('http://redlioncanada.com/api/content/slug/'+slug)
					.success(function (response) {
						person = response[0];
					})
					.error(function (err) {
						alert('ERROR: ' + err);
					});
			}
			return person;
		}
	};
});

app.factory("People", function($http) {
	var people = [];
	
	return {
		get: function() {
			if (people.length === 0) {
				$http.get('http://redlioncanada.com/api/content/type/people')
					.success(function (response) {
						for (var i = 0; i < response.length; i++) {
							people.push(response[i]);
						}
					})
					.error(function (err) {
						alert('ERROR: ' + err);
					});
			}
			return people;
		}
	};
});
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

var countObj = function(a) {
	var count = 0;
	var i;
	
	for (i in a) {
		if (a.hasOwnProperty(i)) {
			count++;
		}
	}
	
	return count;
};