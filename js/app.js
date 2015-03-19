var glCards = [];
var boxid = 0;
var loadInterval;

// Declare app level module which depends on views, and components
var app = angular.module('redLion', ['ngRoute']);
//**********
// Routing
//**********
app.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/grid', {
		template: ' ',
		controller: 'GridControler'
	}).
	when('/work/:campaignID/:subSection', {
		templateUrl: 'templates/work.html',
		controller: 'WorkCtrl'
	}).
	when('/discipline/:disciplineID', {
		templateUrl: 'templates/discipline.html',
		controller: 'DisciplineCtrl'
	}).
	otherwise({
		redirectTo: '/grid'
	});
}]);

//*****************************
// Init load of Building Data
//*****************************
app.controller('CardTestController', function ($scope, Cards, filterFilter) {
	$scope.cards = Cards.get();
	init3D();
});

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

//****************************************
// Grid Controller (nothing to see here)
//****************************************
app.controller('GridControler', function ($scope) {
	console.log("grid connection");
});

//***************************************
// Work Projects Controller & Functions
//***************************************
app.controller('WorkCtrl', ['$scope', '$routeParams', '$sce', '$timeout',
	function($scope, $routeParams, $sce, $timeout) {
		$scope.campaignID = $routeParams.campaignID;
		$scope.startSection = $routeParams.subSection;
		
		if (boxid !== 0) {
			getWorkData($scope, $sce, $timeout);
		} else {
			loadInterval = setInterval(function() {
				if (dataController.GetBySlug($scope.campaignID) !== false) {
					getWorkData($scope, $sce, $timeout, true);
					clearInterval(loadInterval);
				}
			}, 500);
		}
	}
]);

// if there's an audio player, this makes it work
var audioPlayerStart = function() {
	var audioplayers = document.getElementsByClassName('audio_file');
	
	$('.play-pause-btn').click(function() {
		var audioplayer = $(this).siblings('audio').get(0);
		if (audioplayer.paused) {
			audioplayer.play();
			$(this).attr('src', 'img/pause-btn.gif');
		} else {
			audioplayer.pause();
			$(this).attr('src', 'img/play-btn.gif');
		}
	});
	
	$('.rwd-btn').click(function() {
		var audioplayer = $(this).siblings('audio').get(0);
		audioplayer.currentTime = 0;
	});
	
	$('.ffwd-btn').click(function() {
		var audioplayer = $(this).siblings('audio').get(0);
		audioplayer.currentTime += 5;
	});
					
	for (var aps = 0; aps < audioplayers.length; aps++) {
		var media = audioplayers[aps];
		
		setTimeout(audioLoadTimeout, 200, media);
		
		media.addEventListener('timeupdate', function(e) {
			var playbar = $(media).siblings('div.meter')[0];
			var progressbar = $(playbar).children('span')[0];
			var percentComplete = media.currentTime / media.duration * 100;
			$(progressbar).css('width', percentComplete + "%");
			
			var timediv = $(media).siblings('.time-readout')[0];
			var audioCurTime = $(timediv).children('.audioCurrent')[0];
			$(audioCurTime).text(getMinSec(media.currentTime));
		}, false);
		
		media.addEventListener('ended', function(e) {
			media.pause();
		}, false);
	}

};

// This waits for the audio to load
var audioLoadTimeout = function(media) {
	var timediv = $(media).siblings('.time-readout')[0];
	var audioDurTime = $(timediv).children('.audioTotal')[0];
	$(audioDurTime).text(getMinSec(media.duration));
};

// This makes the time readout look pretty
var getMinSec = function (time) {
	var minutes = Math.floor(time / 60);
	var seconds = parseInt(time - minutes * 60);
	if (seconds < 10) seconds = "0" + seconds;
	return minutes + ":" + seconds;
};

// This gets all the data and sets up the Work page
var getWorkData = function($scope, $sce, $timeout, useSlug) {
	
	if (useSlug) $scope.work = dataController.GetBySlug($scope.campaignID);
	else $scope.work = dataController.GetByID(boxid);
	
	$('#blackout').css({'display':'block'});
	$('#blackout').animate({"opacity":1, 'padding-top': 0}, 1000, "easeOutCubic");
	
	$scope.work.date_launched = Date.parse($scope.work.date_launched);
	var videos = $scope.work.video_comsep;
	for (var vids = 0; vids < videos.length; vids++) {
		if ($scope.work.video_comsep[vids] !== '') $scope.work.video_comsep[vids] = $sce.trustAsResourceUrl($scope.work.video_comsep[vids]);
	}
	
	closeButtonStart();
	audioPlayerStart();
	
	var soptions = {
		dots: true,
		infinite: true,
		speed: 500,
		slidesToShow: 1,
		adaptiveHeight: true,
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
};

app.controller("DisciplineCtrl", ['$scope', '$routeParams', '$timeout',
	function($scope, $routeParams, $timeout) {
		$scope.dslug = $routeParams.disciplineID;
		$('#blackout').css({'display':'block'});
		$('#blackout').animate({"opacity":1, 'padding-top': 0}, 1000, "easeOutCubic");
		closeButtonStart();
		
		if (boxid !== 0) {
			$scope.disciplines = dataController.GetByType('disciplines');
		} else {
			loadInterval = setInterval(function() {
				$scope.disciplines = dataController.GetByType('disciplines');
				if ($scope.disciplines.length > 0) {
					clearInterval(loadInterval);
				}
			}, 500);
		}
	}
]);

//


var closeButtonStart = function() {
	$('.close').on('click', function(e) {
		e.preventDefault();
		$('#blackout').animate({"opacity":0, 'padding-top': 50}, 1000, "easeInCubic", function() {
			$(this).css({'display':'none'});
			window.location.href = "#/grid";
		});
	});
};

