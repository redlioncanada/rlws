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
	when('/disciplines/:disciplineID', {
		templateUrl: 'templates/discipline.html',
		controller: 'DisciplineCtrl'
	}).
	when('/news/:newsID', {
		templateUrl: 'templates/news.html',
		controller: 'NewsCtrl'
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
app.controller('GridControler', function ($scope) {});

//************************
// News Controller
//************************
app.controller("NewsCtrl", ['$scope', '$routeParams', '$timeout', '$sce',
	function($scope, $routeParams, $timeout, $sce) {
		$scope.dslug = $routeParams.newsID;
		
		$scope.outputHTML = function(snip) {
			return $sce.trustAsHtml(snip);
		};
		
		if (boxid !== 0) {
			$scope.newsitem = dataController.GetBySlug($scope.dslug);
			$scope.newsitem.date_launched = Date.parse($scope.newsitem.date_launched);
			overlayFadeIn();
			closeButtonStart();
		} else {
			$timeout(function() {
				$scope.newsitem = dataController.GetBySlug($scope.dslug);
				$scope.newsitem.date_launched = Date.parse($scope.newsitem.date_launched);
				overlayFadeIn();
				closeButtonStart();
			}, 1000);
		}
		
	}
]);


//***************************************
// Work Projects Controller & Functions
//***************************************
app.controller('WorkCtrl', ['$scope', '$routeParams', '$sce', '$timeout',
	function($scope, $routeParams, $sce, $timeout) {
		$scope.campaignID = $routeParams.campaignID;
		$scope.startSection = $routeParams.subSection;
		
		$scope.outputHTML = function(snip) {
			return $sce.trustAsHtml(snip);
		};
		
		if (boxid !== 0) {
			getWorkData($scope, $sce, $timeout);
		} else {
			$timeout(function() {
				if (dataController.GetBySlug($scope.campaignID) !== false) {
					getWorkData($scope, $sce, $timeout);
					clearInterval(loadInterval);
				}
			}, 1000);
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
var getWorkData = function($scope, $sce, $timeout) {
	
	$scope.work = dataController.GetBySlug($scope.campaignID);
	
	$scope.work.date_launched = Date.parse($scope.work.date_launched);
	var videos = $scope.work.video_comsep;
	for (var vids = 0; vids < videos.length; vids++) {
		if ($scope.work.video_comsep[vids] !== '' && typeof $scope.work.video_comsep[vids] == 'string') $scope.work.video_comsep[vids] = $sce.trustAsResourceUrl($scope.work.video_comsep[vids]);
	}
	
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
		}, 1000);
	}
	if ($scope.work.digital_comsep[0] !== '') {
		$timeout(function() {
			$('.digitalwork').slick(soptions);
		}, 1000);
	}
	
	audioPlayerStart();
	overlayFadeIn();
	closeButtonStart();
};


//************************
// Discipline Controller
//************************
app.controller("DisciplineCtrl", ['$scope', '$routeParams', '$timeout',
	function($scope, $routeParams, $timeout) {
		$scope.dslug = $routeParams.disciplineID;
		closeButtonStart();
		
		if (boxid !== 0) {
			$scope.disciplines = dataController.GetByType('disciplines');
			overlayFadeIn();
		} else {
			$timeout(function() {
				$scope.disciplines = dataController.GetByType('disciplines');
				overlayFadeIn();
			}, 1000);
		}
		
		$timeout(function() {
			$('.dcontainer.'+$scope.dslug+' p').slideDown();
			$('.dcontainer.'+$scope.dslug+' h1').addClass('selected');
			$('.dcontainer.'+$scope.dslug+' h1 span').html('-');
			
			$('.dcontainer h1').click(function() {
				if (!$(this).hasClass('selected')) {
					$('.dcontainer p').slideUp();
					$('.dcontainer h1').removeClass('selected');
					$('.dcontainer h1 span').html('+');
					$(this).addClass('selected');
					$(this).children('span').html('-');
					$(this).siblings('p').slideDown();
				}
			});
		}, 1200);
		
	}
]);

var overlayFadeIn = function(millisecs, tweentype) {
	if (typeof millisecs == 'undefined') millisecs = 1000;
	if (typeof tweentype == 'undefined') tweentype = "easeOutCubic";
	
	$('#blackout').css({'display':'block'});
	$('#blackout').velocity({"opacity":1, 'padding-top': 0}, {duration: millisecs, easing: tweentype});
	
}

// Universal close button start
var closeButtonStart = function(millisecs, tweentype) {
	if (typeof millisecs == 'undefined') millisecs = 1000;
	if (typeof tweentype == 'undefined') tweentype = "easeOutCubic";
	
	$('.close').on('click', function(e) {
		e.preventDefault();
		$('#blackout').velocity({"opacity":0, 'padding-top': 50}, {duration: millisecs, easing: tweentype, complete: function() {
			$(this).css({'display':'none'});
			window.location.href = "#/grid";
		}});
	});
};

