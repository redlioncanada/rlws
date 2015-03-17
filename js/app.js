var glCards = [];
var boxid;

// Declare app level module which depends on views, and components
var app = angular.module('redLion', ['ngRoute']);
//
app.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/grid', {
		template: ' ',
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
app.controller('WorkCtrl', ['$scope', '$routeParams', '$sce', '$timeout',
	function($scope, $routeParams, $sce, $timeout) {
		$scope.campaignID = $routeParams.campaignID;
		$scope.startSection = $routeParams.subSection;
		
		$scope.work = dataController.GetByID(boxid);
		$scope.work.date_launched = Date.parse($scope.work.date_launched);
		var videos = $scope.work.video_comsep;
		for (var vids = 0; vids < videos.length; vids++) {
			$scope.work.video_comsep[vids] = $sce.trustAsResourceUrl($scope.work.video_comsep[vids]);
		}
		console.log("Campaign ID = " + $scope.campaignID);
		console.log("subSection = " + $scope.startSection);
		console.log($scope.work);
		
		closeButtonStart();
		
		var soptions = {
			dots: true,
			infinite: true,
			speed: 500,
			slidesToShow: 1,
			adaptiveHeight: true,
			cssEase: 'easeInOut'
		};
		if ($scope.work.print_comsep[0] !== '') {
			$timeout(function() {
				$('.printwork').slick(soptions);
			}, 500);
		}
		if ($scope.work.digital_comsep[0] !== '') {
			$timeout(function() {
				$('.digitalwork').slick(soptions);
			}, 500);
		}
/*
		if ($scope.work.audio_comsep[0] !== '') {
			$timeout(function() {
				$('.printwork').slick(soptions);
			});
		}
*/
	}
]);

  
app.controller('PeopleCtrl', ['$scope', '$routeParams', '$http', '$animate',
	function($scope, $routeParams, $http, $animate) {
		$scope.people = [];
		console.log("Person Slug = " +$routeParams.staffID);
		
		closeButtonStart();
		
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

var closeButtonStart = function() {
	$('.close').on('click', function(e) {
		e.preventDefault();
		$('#blackout').animate({"opacity":0, 'padding-top': 50}, 1000, "easeInCubic", function() {
			$(this).css({'display':'none'});
			window.location.href = "#/grid";
		});
	});
};