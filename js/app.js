var glCards = [];

// Declare app level module which depends on views, and components
var app = angular.module('redLion', ['ngRoute']);
//
app.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/grid', {
		template: '',
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
  
app.controller('PeopleCtrl', ['$scope', '$routeParams', '$http', '$animate',
	function($scope, $routeParams, $http, $animate) {
		$scope.people = [];
		console.log("Person Slug = " +$routeParams.staffID);
		
		$scope.go = function ( path ) {
			$location.path( path );
		};
		
		$http.get('http://redlioncanada.com/api/content/type/people')
			.success(function (response) {
				for (var i = 0; i < response.length; i++) {
					$scope.people.push(response[i]);
					if (response[i].slug == $routeParams.staffID) {
						$scope.selperson = response[i];
					}
				}
			})
			.error(function (err) {
				alert('ERROR: ' + err);
			});
	}
]);

app.directive('peopleTile', function() {
	return {
		template: function (element, attrs) {
			return '<img src="img/staff/' + attrs.peopleTile + '-tile.jpg" class="under">' +
			'<img src="img/staff/' + attrs.peopleTile + '-tile-red.jpg" class="cover">';
		},
		link: function(scope, element, attrs) {
            element
                .on('mouseenter',function() {
                    element.children('img.cover').addClass('hovered');
                })
                .on('mouseleave',function() {
                    element.children('img.cover').removeClass('hovered');
                });
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