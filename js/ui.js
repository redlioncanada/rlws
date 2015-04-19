//facebook start
window.fbAsyncInit = function() {
    FB.init({
		appId      : '738219399610044',
		xfbml      : true,
		version    : 'v2.2'
    });
};

(function(d, s, id){
	var js, fjs = d.getElementsByTagName(s)[0];
	if (d.getElementById(id)) {return;}
	js = d.createElement(s); js.id = id;
	js.src = "//connect.facebook.net/en_US/sdk.js";
	fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));
//facebook end

//search start
$('#searchCancel, #search-back-img').on('click', function(e) {
	if (cameraController.animating) return;
	$('#searchTerm').val('');
	$('#cachedTerm').val('');

	SpawnAndGoToCity();

	$('#searchCancel, #search-back-img, #search-back-text').velocity({'opacity':'0'},{duration: 400, complete: function(){
		$('#search-back-text span').html(''); 
		$(this).css('display','none')
	}});
});
$('#searchTerm').on('keydown', function(e) {
	var val = $(this).val();
	var cval = $('#cachedTerm').val();
	if ($(this).val().length > 32) {
		var s = val;
		s = s.substring(0, s.length-1);
		$(this).val(s);
	}
	if (e.keyCode == 13 && $(this).val().length) {	//enter
		if (cameraController.animating) return;
		if ($('#cachedTerm').val().length || $(this).val() == homeKeyword) {	//search returned results
			var result = SpawnAndGoToCity(cval);
			if (result && val != homeKeyword) {
				keywordReturn(cval)
			} else if (result && val == homeKeyword) {
				$('#search-back-img, #search-back-text').velocity({'opacity':'0'},{duration: 400, complete: function(){$(this).css('display','none')}});
			}
			$(this).val('').blur();
			$('#cachedTerm').val('');
			return;
		} else {	//search returned no results
			$(this).val(cityController.city.tag);
			return;
		}
	} else if ((e.keyCode == 9 && val.length > 0) || e.keyCode == 39) {	//tab, right arrow
		e.preventDefault();
		var t = $('#cachedTerm').val();
		$(this).val(t);
	} else if (e.keyCode == 8) {	//backspace
		$('#cachedTerm').val('');
	}
});

function keywordReturn(keyword) {	
	$('#search-back-text span').html(keyword);
	$('#search-back-img, #search-back-text').css('display','block').velocity({'opacity':'1'},{duration:400, delay: 4500});
}

$('#searchTerm').on('input', function(e) {
	var term = $(this).val();
	var search = dataController.GetIdsWithTag(term);
	if (search.length == 0) {
		$('#cachedTerm').val('');
		return;
	} else {
		if (typeof search[0] === 'undefined') {
			$('#cachedTerm').val('');
			return;
		}
	}
	for (var a in search) {
		var tags = search[a].split(', ');
		for (var i in tags) {
			if (tags[i].substring(0,term.length) == term) {
				$('#cachedTerm').val(tags[i]);
				return;
			}
		}
	}
	$('#cachedTerm').val('');
}).on('focus',closeMenu);
//search end

//webgl detection start
if (Detector.webgl) {
	$(canvasDiv).append( renderer.domElement );
} else {
	function _webGLResizeAnon(){$(e).css('padding-top',($('#loading').height()/2-$(e).height()/2-60)+"px")}
	//add background logo
	$('#loading').css({
		'background-image':'url("./img/rl_wordmark_transparent.png")',
		'background-repeat':'no-repeat',
		'background-position':'center center',
		'background-attachment':'fixed'
	});
	//add web gl message
	var e = Detector.addGetWebGLMessage({parent:$('#loading')});
	$(window).on('resize',_webGLResizeAnon);
	_webGLResizeAnon();
	$(e).css('display','block').velocity({'opacity':'1'},{duration: 1000});
}
//webgl detection end

//menu items start
var headerHeight = $('#main-header').outerHeight()-2, lastMenuItem, mapInterval = false;
$('.menu-item').each(function(){
	$(this).css('top',headerHeight-$(this).height());
});
$('#menu a').click(function() {
	var self = this;
	var c = $(this).attr('class').replace(' active','');
	if (!googleMapLoaded && c == 'contact') { 
		if (!mapInterval) {
			loadGoogleMap();
			var mapIntervalAttempts = 0;
			mapInterval = setInterval(function() {
				if (googleMapLoaded || ++mapIntervalAttempts > 10) {
					clearInterval(mapInterval);
					mapInterval = false;
					doAnimation();
				}
			},300);
		}
	} else {
		doAnimation();
	}

	function doAnimation() {
		$('#menu a').removeClass('active');
		$('.menu-item').not('.'+c).each(function() {
			$(this).css('z-index',250).velocity({top: headerHeight - $(this).height()},{duration: 300});
		});
		if (lastMenuItem != c) {$(self).addClass('active'); $('.menu-item.'+c).css('z-index',251).velocity({top: headerHeight+1},{duration:300}); lastMenuItem = c;}
		else {closeMenu();}
	}
});
function closeMenu() {
	$('#menu a').removeClass('active');
	$('.menu-item').each(function(){
		$(this).css('z-index',250).velocity({'top':headerHeight-$(this).height()},{duration: 300});
	});

	lastMenuItem = '';
}
function scrollTop() {
	$('html, body').velocity({scrollTop: 0},{duration:500});
}
$('.menu-item-footer,.mobile-menu-item-footer').click(function(){closeMenu(); scrollTop();});
$('#canvas').on('mousedown',closeMenu);
//menu items end

//loading overlay start
dataController.on('loaded', function() {
	$('#loadinglogo').velocity({opacity:0},{duration: 800, complete: function() {
		clearInterval(brentSpinner);
		$('#loadinglogo').css('display', 'none');
		$('#loading').velocity({'opacity':'0'},{duration: 1200, complete: function() {
			$('#loading').css('display', 'none');
		}});
	}});
}, 'overlay');
//loading overlay end

//mobile menu start
$('#mobile-menu').click(function() {
	$('.mobile').click();
});
$('.mobile-menu-item-header').click(function() {
	var c = $(this).attr('class').replace('mobile-menu-item-header ','');
	closeMenu();
	$('#menu .'+c).click();
});
//mobile menu end

//resize start
$('#content').css('height',window.innerHeight-headerHeight);
$(window).on('resize', function() {
	$('#content').css('height',window.innerHeight-headerHeight);
});
//resize end

//google map start
var googleMapLoaded = false;
function initGoogleMap() {
	var mapCanvas = document.getElementById('map-canvas');
	var map = new google.maps.Map(mapCanvas, {
		center: new google.maps.LatLng(43.6533998,-79.3742563),
		zoom: 16,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		backgroundColor: '#fffdf2',
		disableDefaultUI: true
	});
	var marker = new google.maps.Marker({
		position: new google.maps.LatLng(43.6533998,-79.3742563),
		map: map,
		icon: 'img/map-marker.png'
	});
	map.set('styles', [
	  {
	    "stylers": [
	      { "visibility": "simplified" },
	      { "saturation": -100 },
	      { "weight": 4.2 }
	    ]
	  },
	  {
	    "elementType": "labels.icon",
	    "stylers": [
	      { "saturation": -95 },
	      { "visibility": "off" }
	    ]
	  },
	  {
	    "featureType": "poi",
	    "stylers": [
	      { "visibility": "off" }
	    ]
	  },{
	    "featureType": "transit",
	    "stylers": [
	      { "visibility": "off" }
	    ]
	  }
	]);
	var mapLoadInterval = setInterval(function(){
		var gm = $('.gm-style');
		if ($(gm).length) {
			$(gm).css('opacity',1);
			googleMapLoaded = true;
			clearInterval(mapLoadInterval);
		}
	}, 100);
}
function loadGoogleMap() {
	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&callback=initGoogleMap';
	document.body.appendChild(script);
}
//google map end

//indicator start
indicator.on('show', function() {
	var i = $('#indicator');
	if (!$(i).hasClass('velocity-animating') && $(i).css('opacity') !== 1) $(i).velocity({"opacity":1}, {duration: 200, queue: false});
});

indicator.on('hide', function() {
	var i = $('#indicator');
	if (!$('#indicator').hasClass('velocity-animating') && $(i).css('opacity') !== 0) $('#indicator').velocity({"opacity":0}, {duration: 200, queue: false});
});

indicator.on('update', function() {
	var c = $('#canvas');
	var cWidth = parseInt($(c).width()), cHeight = parseInt($(c).height()), cTop = parseInt($(c).position().top), cLeft = parseInt($(c).position().left);
	var indPosition = this.GetPosition({
		left: 0,
		width: cWidth,
		top: 0, 
		height: cHeight
	});

	if (!cityController.city || !cityController.defaultCity) return;
	if (indPosition && !cityController.CityIsInView(homeKeyword,10) && cityController.city.tag == cityController.defaultCity.tag) {
		this.Show();
		var indicator = $('#indicator');
		$(indicator).css({
			'left': indPosition.X == 0 ? indPosition.X + cLeft : indPosition.X - $(indicator).width() + cLeft,
			'top': indPosition.Y == 0 ? indPosition.Y + cTop : indPosition.Y - $(indicator).height() + cTop,
			'-webkit-transform': 'rotate(' + indPosition.rotation + 'deg)',
            '-moz-transform': 'rotate(' + indPosition.rotation + 'deg)',
            '-ms-transform': 'rotate(' + indPosition.rotation + 'deg)',
            '-o-transform': 'rotate(' + indPosition.rotation + 'deg)',
            'transform': 'rotate(' + indPosition.rotation + 'deg)'
		});
	} else {
		this.Hide();
	}

	if (debugIndicator) {
		if (!$('#test').length) $('#content').append('<canvas id="test" style="position:absolute;"></canvas>');
		$('#test').css({
			'left': $(c).position().left,
			'width': cWidth,
			'top': $(c).position().top,
			'height': cHeight
		});

		var test = document.getElementById('test');
		var context = test.getContext('2d');
		test.width = cWidth;
		test.height = cHeight;
		context.clearRect(0, 0, cWidth, cHeight);
		drawLine(this.colliderLine, 'red');
	    drawLine(this.raycastLine, 'blue');
	    if (indPosition) drawPoint(indPosition.X, indPosition.Y, 'green');
	}

	function drawPoint(x, y, color) {
	    context.fillStyle = color || 'black';
	    context.beginPath();
	    context.arc(x, y, 10, 0, 2 * Math.PI, true);
	    context.fill();
	};

	function drawLine(line, color) {
	    color = color || 'black';
	    context.strokeStyle = color;
	    context.beginPath();
	    context.moveTo(line.X1, line.Y1);
	    context.lineTo(line.X2, line.Y2);
	    context.lineWidth = 5;
	    context.stroke();
	};
});

$('#indicator').click(function() {
	SpawnAndGoToCity(cityController.city);
});
//indicator end

//overlay start
$('#blackout').on("click", function(evt) {
    evt.stopPropagation();
    if($($(evt.target).context).attr('id') == 'blackout') {
	    cameraController.AnimateBlur(0,1);
    	$(this).velocity({"opacity":0, 'padding-top': 50}, {duration: 1000, easing: "easeOutCubic", complete: function() {
			$(this).css({'display':'none'});
			window.location.href = "#/grid";
		}});
    }
});
var w = [83,65,82,67,65,83,77], cw=0;
$(document).on('keydown', function(e) {if ($('#discipline-overlay').length && !$('.sarcasm').length && e.keyCode==w[cw++]) {if(cw==w.length){cw=0;$('#discipline-overlay header').after('<div class="dcontainer sarcasm" ng-repeat="disc in disciplines"><h1 class="ng-binding"><span>+</span> &nbsp;Sarcasm</h1><p style="display:none;" class="ng-binding">We never use sarcasm in any way, shape or form. There is no room for humour in a professional environment, and sarcasm is the lowest form of humour. Sarcasm is basically lying. If you work with Red Lion, you can rest assured that this disgusting practice will not be employed.<br/>#stopsarcasm</p></div>');$('#blackout').animate({'scrollTop':0},500)}} else {cw=0;}});
//overlay end