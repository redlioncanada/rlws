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
app.controller('GridControler', function ($scope) {
	if( $("#blackout").css('display') == 'block') {
		$('#blackout').velocity({"opacity":0, 'padding-top': 50}, {duration: millisecs, easing: tweentype, complete: function() {
			$(this).css({'display':'none'});
		}});
	}
});

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
			socialStart('News', $scope.newsitem);
		} else {
			$timeout(function() {
				$scope.newsitem = dataController.GetBySlug($scope.dslug);
				$scope.newsitem.date_launched = Date.parse($scope.newsitem.date_launched);
				overlayFadeIn();
				closeButtonStart();
				socialStart('News', $scope.newsitem);
			}, 1000);
		}
		
	}
]);


//***************************************
// Work Projects Controller & Functions
//***************************************
app.controller('WorkCtrl', ['$scope', '$routeParams', '$sce', '$timeout', 'preloader',
	function($scope, $routeParams, $sce, $timeout, preloader) {
		$scope.campaignID = $routeParams.campaignID;
		$scope.startSection = $routeParams.subSection;
		
		$scope.outputHTML = function(snip) {
			return $sce.trustAsHtml(snip);
		};
		
		if (boxid !== 0) {
			getWorkData($scope, $sce, $timeout, preloader);
		} else {
			$timeout(function() {
				if (dataController.GetBySlug($scope.campaignID) !== false) {
					getWorkData($scope, $sce, $timeout, preloader);
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
var getWorkData = function($scope, $sce, $timeout, preloader) {
	
	$scope.work = dataController.GetBySlug($scope.campaignID);
	
	socialStart($scope.work.title, $scope.work.subtitle);
	
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
	
	var plImages = [];
	var pImages = false;
	var dImages = false;
	
	if ($scope.work.print_comsep[0] !== '') {
		plImages = plImages.concat($scope.work.print_comsep);
		pImages = true;
	}
	
	if ($scope.work.digital_comsep[0] !== '') {
		plImages = plImages.concat($scope.work.digital_comsep);
		dImages = true;
	}
	
	
	if (plImages.length > 0) {	
		preloader.preloadImages( plImages ).then(
			function handleResolve( imageLocations ) {
				if (pImages) $('.printwork').slick(soptions);
				if (dImages) $('.digitalwork').slick(soptions);
			},
			function handleReject( imageLocation ) {
				console.error( "Image Failed", imageLocation );
			},
			function handleNotify( event ) {
				//console.info( "Percent loaded:", event.percent );
			}
		);
	}
	
	
/*
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
*/
	
	audioPlayerStart();
	overlayFadeIn();
	closeButtonStart();
};

app.factory( "preloader", function( $q, $rootScope ) {

	function Preloader( imageLocations ) {
		this.imageLocations = imageLocations;
		this.imageCount = this.imageLocations.length;
		this.loadCount = 0;
		this.errorCount = 0;

		this.states = {
			PENDING: 1,
			LOADING: 2,
			RESOLVED: 3,
			REJECTED: 4
		};

		this.state = this.states.PENDING;
		this.deferred = $q.defer();
		this.promise = this.deferred.promise;

	}

	Preloader.preloadImages = function( imageLocations ) {
		var preloader = new Preloader( imageLocations );
		return( preloader.load() );
	};

	Preloader.prototype = {

		constructor: Preloader,

		isInitiated: function isInitiated() {
			return( this.state !== this.states.PENDING );
		},

		isRejected: function isRejected() {
			return( this.state === this.states.REJECTED );
		},

		isResolved: function isResolved() {
			return( this.state === this.states.RESOLVED );
		},

		load: function load() {

			if ( this.isInitiated() ) {
				return( this.promise );
			}

			this.state = this.states.LOADING;

			for ( var i = 0 ; i < this.imageCount ; i++ ) {
				this.loadImageLocation( this.imageLocations[ i ] );
			}

			return( this.promise );
		},

		handleImageError: function handleImageError( imageLocation ) {

			this.errorCount++;

			if ( this.isRejected() ) {
				return;
			}

			this.state = this.states.REJECTED;
			this.deferred.reject( imageLocation );
		},

		handleImageLoad: function handleImageLoad( imageLocation ) {

			this.loadCount++;
			
			if ( this.isRejected() ) {
				return;
			}

			this.deferred.notify({
				percent: Math.ceil( this.loadCount / this.imageCount * 100 ),
				imageLocation: imageLocation
			});

			if ( this.loadCount === this.imageCount ) {
				this.state = this.states.RESOLVED;
				this.deferred.resolve( this.imageLocations );
			}

		},

		loadImageLocation: function loadImageLocation( imageLocation ) {

			var preloader = this;
			var image = $( new Image() )
				.load(
					function( event ) {

						$rootScope.$apply(
							function() {
								preloader.handleImageLoad( event.target.src );
								preloader = image = event = null;
							}
						);

					}
				)
				.error(
					function( event ) {
						$rootScope.$apply(
							function() {
								preloader.handleImageError( event.target.src );
								preloader = image = event = null;
							}
						);
					}
				)
				.prop( "src", imageLocation );
		}

	};
	return( Preloader );
});


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
			socialStart('Disciplines', titleCase($scope.dslug));
		} else {
			$timeout(function() {
				$scope.disciplines = dataController.GetByType('disciplines');
				overlayFadeIn();
				socialStart('Disciplines', titleCase($scope.dslug));
			}, 1000);
		}
		
		$timeout(function() {
			$('.dcontainer.'+$scope.dslug+' p').slideDown();
			$('.dcontainer.'+$scope.dslug+' h1').addClass('selected');
			$('.dcontainer.'+$scope.dslug+' h1 span').html('-');
			
			$('.dcontainer h1').click(function() {
				if (!$(this).hasClass('selected')) {
					window.location.href = "#/disciplines/" + $(this).attr("data-slug");
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

var loc, newtitle;

var socialStart = function(title, subtitle) {
	loc = escape(window.location.href);
	newtitle  = escape(title + " - " + subtitle + " || Red Lion Canada");
	
	$('img.twitter').click(function(e){
		e.preventDefault();
		window.open('http://twitter.com/share?url=' + loc + '&text=' + newtitle, 'twitterwindow', 'height=450, width=550, top='+($(window).height()/2 - 225) +', left='+$(window).width()/2 +', toolbar=0, location=0, menubar=0, directories=0, scrollbars=0');
	});
	
	$('img.facebook').click(function(e) {
		e.preventDefault();
		FB.ui({
			method: 'share',
			href: loc,
		}, function(response){});
	});
	
	$('img.linkedin').click(function(e) {
		e.preventDefault();
		window.open('https://www.linkedin.com/shareArticle?mini=true&url=' + loc + '&title=' + newtitle, 'linkedinwindow', 'height=450, width=550, top='+($(window).height()/2 - 225) +', left='+$(window).width()/2 +', toolbar=0, location=0, menubar=0, directories=0, scrollbars=0');
	});
}

var titleCase = function(str) {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}