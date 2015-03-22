//search start
$('#searchCancel').on('click', function(e) {
	SpawnAndGoToCity(homeKeyword);
	$('#searchCancel').animate({'opacity':'0'},400,function(){$(this).css('display','none')});
});
$('#searchTerm').on('keydown', function(e) {
	var val = $(this).val();
	if ($(this).val().length > 32) {
		var s = val;
		s = s.substring(0, s.length-1);
		$(this).val(s);
	}
	if (e.keyCode == 13 && $(this).val().length) {	//enter
		if ($('#cachedTerm').val().length || $(this).val() == homeKeyword) {	//search returned results
			var result = SpawnAndGoToCity(val);
			if (result && val != homeKeyword) {
				$('#searchCancel').css('display','block').animate({'opacity':'1'},400);
			} else if (result && val == homeKeyword) {
				$('#searchCancel').animate({'opacity':'0'},400,function(){$(this).css('display','none')});
			}
			$('#cachedTerm').val('');
			$(this).val('');
			return;
		} else {	//search returned no results
			$(this).val('');
			return;
		}
	} else if (e.keyCode == 9 || e.keyCode == 39) {	//tab, right arrow
		e.preventDefault();
		var t = $('#cachedTerm').val();
		$(this).val(t);
	} else if (e.keyCode == 8) {	//backspace
		$('#cachedTerm').val('');
	}
});
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
});
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
	$(e).css('display','block').animate({'opacity':'1'},1000);
}
//webgl detection end

//menu items start
var headerHeight = $('#main-header').outerHeight(), lastMenuItem, mapInterval = false;
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
		console.log('blagh');
		$('#menu a').removeClass('active');
		$('.menu-item').not('.'+c).each(function() {
			$(this).animate({top: headerHeight - $(this).height()},300);
		});
		if (lastMenuItem != c) {$(self).addClass('active'); $('.menu-item.'+c).animate({top: headerHeight+1},300); lastMenuItem = c;}
		else {$(self).removeClass('active'); $('.menu-item.'+c).animate({top: headerHeight - $('.menu-item.'+c).height()},300); lastMenuItem = '';}
	}
});
$('.menu-item-footer').click(function(){
	$('#menu a').removeClass('active');
	$('.menu-item').each(function(){
		$(this).animate({'top':headerHeight-$(this).height()},300);
	});

	lastMenuItem = '';
});
//menu items end

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