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
	closeAction();
});

//************************
// News Controller
//************************
app.controller("NewsCtrl", ['$scope', '$routeParams', '$timeout', '$sce',
	function($scope, $routeParams, $timeout, $sce) {
		$scope.dslug = $routeParams.newsID;
		closeButtonStart(true);
		
		$scope.outputHTML = function(snip) {
			return $sce.trustAsHtml(snip);
		};
		
		$scope.parseMyDate = function(datestr) {
			if (datestr instanceof Date) {
				return datestr;
			} else {
				var t = datestr.split(/[- :]/);
				var d = new Date(t[0], t[1]-1, t[2], t[3], t[4], t[5]);
				return new Date(d);
			}
			//return Date.parse(datestr); iOS doesn't like this.
		}
		
		if (boxid !== 0) {
			$scope.newsitems = dataController.GetByType('news');
			overlayFadeIn();
			socialStart('News', titleCase($scope.dslug));
		} else {
			$timeout(function() {
				$scope.newsitems = dataController.GetByType('news');
				overlayFadeIn();
				socialStart('news', titleCase($scope.dslug));
			}, 1500);
		}
		
		var animationTiming = 800;
		
		$timeout(function() {
			
			$('#blackout').animate({'scrollTop': $('.ncontainer.'+$scope.dslug+' h1').offset().top}, 500, function() {
				$('.ncontainer.'+$scope.dslug+' .title').addClass('selected');
				$('.ncontainer.'+$scope.dslug+' .title h1 span').html('-');
				$('.ncontainer.'+$scope.dslug+' .title .cover').velocity({height: '74px'},{duration: animationTiming});
				$('.ncontainer.'+$scope.dslug+' .newscontent').velocity('slideDown',{duration: animationTiming});
				te('map-clicks',"news-item-clicked",$scope.dslug);
			});
			socialStart('Red Lion News', $('.ncontainer.'+$scope.dslug+' .title').html().replace(/(<([^>]+)>)/ig,""));
			
			$('#overlay').on('click', '.ncontainer .title', function() {
				socialStart('Red Lion News', titleCase($scope.dslug));
				if (!$(this).children('.ncontainer .title h1').hasClass('selected')) {
					var title = $(this);
					$('.ncontainer .newscontent').velocity('slideUp',{duration: animationTiming});
					$('.ncontainer .title').removeClass('selected');
					$('.ncontainer .title h1 span').html('+').css('padding',0);
					$('.ncontainer .title .cover').velocity({height: '2px'},{duration: animationTiming});
					title.addClass('selected');
					title.find('h1 span').html('-').css({'padding-left':3,'padding-right':4});
					title.children('.cover').velocity({height: '74px'},{duration: animationTiming});
					title.siblings('.newscontent').velocity('slideDown',{duration: animationTiming});
					te('overlay',"news-item-clicked",title.attr('slug'));
					//console.log(title);
				} else {
					var title = $(this);
					title.removeClass('selected');
					title.find('h1 span').html('+').css('padding',0);
					title.children('.cover').velocity({height: '74px'},{duration: animationTiming});
					title.siblings('.newscontent').velocity('slideUp',{duration: animationTiming});
				}
			});
		}, 1500);
		
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
		
		$scope.parseMyDate = function(datestr) {
			if (datestr instanceof Date) {
				return datestr;
			} else {
				var t = datestr.split(/[- :]/);
				var d = new Date(t[0], t[1]-1, t[2], t[3], t[4], t[5]);
				return new Date(d);
			}
			//return Date.parse(datestr); iOS doesn't like this.
		}
		
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
	var media = document.getElementById('audio_file');
	
	media.volume = 0.2;
	
	var playbar = $(media).siblings('div.meter')[0];
	var progressbar = $(playbar).children('span')[0];
	var timediv = $(media).siblings('.time-readout')[0];
	var audioCurTime = $(timediv).children('.audioCurrent')[0];
	
	$('.swap-audio').click(function(e) {
		e.preventDefault();
		$('.play-pause-btn').attr('src', 'img/play-btn.gif');
		media.pause();
		media.src = $(this).attr('data-audio');
		setTimeout( function() {
			$('.play-pause-btn').attr('src', 'img/pause-btn.gif');
			$(audioCurTime).text('0:00');
			setTimeout(audioLoadTimeout,500,media);
			$(progressbar).css('width', "0%");
			media.play();
		}, 200);
		return false;
	})
	
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
	
	setTimeout(audioLoadTimeout, 200, media);
	
	media.addEventListener('timeupdate', function(e) {
		var percentComplete = media.currentTime / media.duration * 100;
		$(progressbar).css('width', percentComplete + "%");
		$(audioCurTime).text(getMinSec(media.currentTime));
	}, false);
	
	media.addEventListener('ended', function(e) {
		media.pause();
	}, false);

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
	te('map-clicks',"work-item-clicked",$scope.work.slug);
	
	$scope.work.date_launched = $scope.parseMyDate($scope.work.date_launched);
	var videos = $scope.work.video_comsep;
	for (var vids = 0; vids < videos.length; vids++) {
		if ($scope.work.video_comsep[vids] !== '' && typeof $scope.work.video_comsep[vids] == 'string') $scope.work.video_comsep[vids] = $sce.trustAsResourceUrl($scope.work.video_comsep[vids]+'?title=0&byline=0&badge=0&color=e0280a&portrait=0');
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
	
	if ($scope.work.preloadedImages === undefined && plImages.length > 0) {	
		preloader.preloadImages( plImages ).then(
			function handleResolve( imageLocations ) {
				if (pImages) $('.printwork').slick(soptions);
				if (dImages) $('.digitalwork').slick(soptions);
				$scope.work.preloadedImages = true;
			},
			function handleReject( imageLocation ) {
				console.error( "Image Failed", imageLocation );
			},
			function handleNotify( event ) {
				//console.info( "Percent loaded:", event.percent );
			}
		);
	} else {
		$timeout( function() {
			if (pImages) $('.printwork').slick(soptions);
			if (dImages) $('.digitalwork').slick(soptions);
		}, 200);
	}
	
	setTimeout(audioPlayerStart, 1000);
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
app.controller("DisciplineCtrl", ['$scope', '$routeParams', '$timeout', '$sce',
	function($scope, $routeParams, $timeout, $sce) {
		$scope.dslug = $routeParams.disciplineID;
		closeButtonStart(true);
		$('#blackout').scrollTop(0);
		
		$scope.outputHTML = function(snip) {
			if (isMobile) {
				snip = snip.replace(new RegExp("<br>", 'g'), "");
			}
			return $sce.trustAsHtml(snip);
		};
		
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
			$('#blackout').animate({'scrollTop': $('.dcontainer.'+$scope.dslug+' h1').offset().top}, 500, function() {
				$('.dcontainer.'+$scope.dslug+' h1').addClass('selected');
				$('.dcontainer.'+$scope.dslug+' h1 span').html('-');
				$('.dcontainer.'+$scope.dslug+' p').slideDown();
				te('overlay',"discipline-clicked",$scope.dslug);
			}); 
			
			$('#overlay').on('click', '.dcontainer h1', function() {
				if (!$(this).hasClass('selected')) {
					$('.dcontainer p').slideUp();
					$('.dcontainer h1').removeClass('selected');
					$('.dcontainer h1 span').html('+').css('padding',0);
					$(this).addClass('selected');
					$(this).children('span').html('-').css({'padding-left':3,'padding-right':4});
					$(this).siblings('p').slideDown();
					te('overlay',"discipline-clicked",$(this).attr('slug'));
				} else {
					$(this).removeClass('selected');
					$(this).children('span').html('+').css('padding',0);
					$(this).siblings('p').slideUp();
				}
			});
		}, 1500);
		
	}
]);

var overlayFadeIn = function(millisecs, tweentype) {
	if (typeof millisecs == 'undefined') millisecs = 1000;
	if (typeof tweentype == 'undefined') tweentype = "easeOutCubic";
	var overlaydelay = 0;
	overlayShown = true;
	
	$('#overlay header h1, #overlay header h2').css('left','-800px');
	$('#overlay button.close, #overlay .social-btns').css('right', '-30px');
	$('#overlay #description, #overlay .overlay-content').css({'margin-top':'100px', 'opacity':0});
	
	cameraController.AnimateBlur(0.003,2);
	$('#blackout').css({'display':'block'});
	$('#blackout').velocity({"opacity":1, 'padding-top': 0}, {duration: overlaybuildtime, easing: tweentype});
	
	setTimeout( function() {
		$('#overlay header h2').velocity({"left":'20px'}, {duration: overlaybuildtime, easing: tweentype});
	}, overlaydelay);
	
	overlaydelay = overlaydelay + overlayanimationdelay;
	
	setTimeout( function() {
	$('#overlay button.close').velocity({"right":'20px'}, {duration: overlaybuildtime, easing: tweentype});
	}, overlaydelay);
	
	overlaydelay = overlaydelay + overlayanimationdelay;
	
	setTimeout( function() {
	$('#overlay .social-btns').velocity({"right":'23px'}, {duration: overlaybuildtime, easing: tweentype});
	}, overlaydelay);
	
	overlaydelay = overlaydelay + overlayanimationdelay;
	
	setTimeout(function() {
		$('#overlay header h1').velocity({"left":'20px'}, {duration: overlaybuildtime, easing: tweentype});
	}, overlaydelay);
	
	overlaydelay = overlaydelay + overlayanimationdelay;
	
	setTimeout(function() {
		if ($('#overlay #description').length) {
			$('#overlay #description').velocity({"margin-top":'0px', 'opacity':1}, {duration: overlaybuildtime, easing: tweentype});
		}
	}, overlaydelay);
	
	overlaydelay = overlaydelay + overlayanimationdelay;
	
	setTimeout(function() {
		$('#overlay .overlay-content').velocity({"margin-top":'0px', 'opacity':1}, {duration: overlaybuildtime, easing: tweentype});
	}, overlaydelay);
}

// Universal close button start
var closeButtonStart = function(ctrl, millisecs, tweentype) {
	if (typeof millisecs == 'undefined') millisecs = 1000;
	if (typeof tweentype == 'undefined') tweentype = "easeOutCubic";
	if (typeof ctrl == 'undefined') ctrl = "";
	
	if (ctrl == true) {
		$('#overlay').off('click');
	}
	
	$('.close').on('click', function(e) {
		e.preventDefault();
		te('overlay',"close-clicked");
		closeAction(millisecs, tweentype)
	});
};

var closeAction = function(ctrl, millisecs, tweentype) {
	overlayShown = false;
	if (typeof millisecs == 'undefined') millisecs = 1000;
	if (typeof tweentype == 'undefined') tweentype = "easeOutCubic";
	cameraController.AnimateBlur(0,1);
	$('#blackout').velocity({"opacity":0, 'padding-top': 50}, {duration: millisecs, easing: tweentype, complete: function() {
		$('#blackout').scrollTop(0);
		$(this).css({'display':'none'});
		window.location.href = "#/grid";
	}});
};

var loc, newtitle;

var socialStart = function(title, subtitle) {
	loc = escape(window.location.href);
	newtitle  = escape(title + " - " + subtitle + " || Red Lion Canada #redlion #redefine");
	
	$('.twitter, .facebook, .linkedin').off('click');
	
	$('.twitter').on('click',function(e){
		e.preventDefault();
		e.stopPropagation();
		te('share',"twitter",title + " - " + subtitle);
		window.open('http://twitter.com/share?url=' + loc + '&text=' + newtitle, 'twitterwindow', 'height=450, width=550, top='+($(window).height()/2 - 225) +', left='+$(window).width()/2 +', toolbar=0, location=0, menubar=0, directories=0, scrollbars=0');
	});
	
	$('.facebook').on('click',function(e) {
		e.preventDefault();
		e.stopPropagation();
		te('share',"facebook",title + " - " + subtitle);
		FB.ui({
			method: 'share',
			href: window.location.href,
		}, function(response){});
	});
	
	$('.linkedin').on('click',function(e) {
		e.preventDefault();
		e.stopPropagation();
		te('share',"linkedin",title + " - " + subtitle);
		window.open('https://www.linkedin.com/shareArticle?mini=true&url=' + loc + '&title=' + newtitle, 'linkedinwindow', 'height=450, width=550, top='+($(window).height()/2 - 225) +', left='+$(window).width()/2 +', toolbar=0, location=0, menubar=0, directories=0, scrollbars=0');
	});
}

var titleCase = function(str) {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}