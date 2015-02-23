// Rudimentary Controls with keyboard vars
var mUP = false;
var mDOWN = false;
var mRIGHT = false;
var mLEFT = false;
var mGOIN = false;
var mGOOUT = false;
var mROTUP = false;
var mROTDOWN = false;

// Three.JS/WebGL init vars
var camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 10000 );
var scene = new THREE.Scene();
scene.fog = new THREE.FogExp2( 0xfffdf2, 0.25 );
var renderer = new THREE.WebGLRenderer();
var light = null;

// Boxes vars
var objects = [];
var gridSizex = 1.2;
var gridSizey = 1.5;
var maxX = 6;
var maxY = 6;
var colors = [0xe1251d,0x3ba6c3];
var boxheight = 1.3;
var boxwidth = 1;

// Touch Events vars
var oldTouchX = 0;
var oldTouchY = 0;
var xMove = 0;
var yMove = 0;
var mTouchDown = false;
var mTouchMove = false;
var overlay = false;

// Render init
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMapEnabled = true;
document.body.appendChild( renderer.domElement );

function moveCamX(x) {
	camera.position.x += x;
	light.position.x += x;
}

function moveCamY(y) {
	camera.position.y += y;
	light.position.y += y;
}

function render() {
	requestAnimationFrame( render );
	//cube.rotation.x += 0.1;
	//cube.rotation.y += 0.1;
	if (!overlay) {
		if (mRIGHT) moveCamX(0.1);
		if (mLEFT) moveCamX(-0.1);
		if (mUP) moveCamY(0.1);
		if (mDOWN) moveCamY(-0.1);
		if (mGOIN) camera.position.z -= 0.1;
		if (mGOOUT) camera.position.z += 0.1;
		if (xMove) moveCamX((xMove/200) * -1);
		if (yMove) moveCamY(yMove/200);
		if (mROTUP && camera.rotation.x < 0.9) {
			camera.rotation.x += 0.03;
		}
		if (mROTDOWN && camera.rotation.x > 0) {
			camera.rotation.x -= 0.03;
		}
		renderer.render( scene, camera );
	}
}

// Keyboard Controls - key down event
$(document).keydown(function( event ) {
	if ( event.which == 38 ) { // UP
		event.preventDefault();
		mUP = true;
	}
	if (event.which == 40) { // DOWN
		event.preventDefault();
		mDOWN = true;
	}
	if (event.which == 37) { // LEFT
		event.preventDefault();
		mLEFT = true;
	}
	if (event.which == 39) { // RIGHT
		event.preventDefault();
		mRIGHT = true;
	}
	if (event.which == 34) { // PGDN
		event.preventDefault();
		mGOIN = true;
	}
	if (event.which == 33) { // PGUP
		event.preventDefault();
		mGOOUT = true;
	}
	if (event.which == 36) { // HOME
		event.preventDefault();
		mROTUP = true;
	}
	if (event.which == 35) { // END
		event.preventDefault();
		mROTDOWN = true;
	}
});

// Keyboard Controls - key up event
$(document).keyup(function(event) {
	if ( event.which == 38 ) { // UP
		event.preventDefault();
		mUP = false;
	}
	if (event.which == 40) { // DOWN
		event.preventDefault();
		mDOWN = false;
	}
	if (event.which == 37) { // LEFT
		event.preventDefault();
		mLEFT = false;
	}
	if (event.which == 39) { // RIGHT
		event.preventDefault();
		mRIGHT = false;
	}
	if (event.which == 34) { // PGDN
		event.preventDefault();
		mGOIN = false;
	}
	if (event.which == 33) { // PGUP
		event.preventDefault();
		mGOOUT = false;
	}
	if (event.which == 36) { // HOME
		event.preventDefault();
		mROTUP = false;
	}
	if (event.which == 35) { // END
		event.preventDefault();
		mROTDOWN = false;
	}
});

// Box Clicked Function
function boxClicked(intersect) {
	console.log(glCards[parseInt(intersect.name)]);
	$('#blackout').css({'display':'block'}).animate({'opacity': 1},500);
	overlay = true;
	$('#overlay').html('box clicked: ' + intersect.name + "<br>Content title: " + glCards[parseInt(intersect.name)].title + "<br>Description: " + glCards[parseInt(intersect.name)].description + '<br>Image: <img src="' + glCards[parseInt(intersect.name)].img + '">');
	$('#blackout').on('click', function(e) {
		$(this).animate({'opacity': 0}, 500, function() {
			$('#blackout').css({'display':'none'});
			overlay = false;
		});
		$(this).unbind('click');
	});
}

// Mouse/Finger Down Function
function onDocumentMouseDown( event, vector ) {
	if (!overlay) {
		if (typeof vector === 'undefined') {
			var touchX = ( event.clientX / window.innerWidth ) * 2 - 1;
			var touchY = -( event.clientY / window.innerHeight ) * 2 + 1;
			vector = new THREE.Vector3( touchX, touchY, 0.5 );
		}
		
		var raycaster = new THREE.Raycaster();
		vector.unproject( camera );
		raycaster.set( camera.position, vector.sub( camera.position ).normalize() );
		var intersects = raycaster.intersectObjects(objects);
		
		if ( intersects.length > 0 ) boxClicked(intersects[0].object);
	}
}

// Touch Events - Start (Finger down)
document.addEventListener('touchstart', function(e) {
	e.preventDefault();
	var touch = e.touches[0];
	oldTouchX = touch.pageX;
	oldTouchY = touch.pageY;
	mTouchDown = true;
}, false);

// Touch Events - End (Finger up)
document.addEventListener('touchend', function(e) {
	e.preventDefault();
	var touch = e.touches[0];
	
	if (xMove < 1 && xMove > -1 && yMove < 1 && yMove > -1) {
		var touchX = ( e.pageX / window.innerWidth ) * 2 - 1;
		var touchY = -( e.pageY / window.innerHeight ) * 2 + 1;
		var vector = new THREE.Vector3( touchX, touchY, 0.5 );
		onDocumentMouseDown( e, vector );
	}
	xMove = 0;
	yMove = 0;
}, false);

// Touch Events - Move (Finger drag)
document.addEventListener('touchmove', function(e) {
	e.preventDefault();
	var touch = e.touches[0];
	xMove = touch.pageX - oldTouchX;
	oldTouchX = touch.pageX;
	yMove = touch.pageY - oldTouchY;
	oldTouchY = touch.pageY;
	mTouchMove = true;
}, false);

function init3D() {
	
	document.addEventListener('mousedown', onDocumentMouseDown);
	
	// Objects init - plane (ground)
	var geometry = new THREE.PlaneBufferGeometry( 100, 100 );
	var material = new THREE.MeshPhongMaterial( {color: 0xfffdf2, side: THREE.DoubleSide} );
	var plane = new THREE.Mesh( geometry, material );
	scene.add( plane );
	plane.position.z = -0.2;
	
	// Objects init - boxes (buildings)
	var x;
	var y;
	for (x = 1; x <= maxX; x++) {
		for (y = 1; y <= maxY; y++) {
			var thisbox = {};
			thisbox.geometry = new THREE.BoxGeometry( boxwidth, boxheight, (Math.random() * 3) + 1 );
			thisbox.material = new THREE.MeshLambertMaterial( {color: colors[Math.round(Math.random())] }); //new THREE.MeshBasicMaterial( { color: colors[Math.round(Math.random())] } );
			thisbox.cube = new THREE.Mesh( thisbox.geometry, thisbox.material );
			thisbox.cube.name = ((x-1)*maxX)+y;
			scene.add( thisbox.cube );
			objects.push(thisbox.cube);
			thisbox.cube.position.x = x * gridSizex;
			thisbox.cube.position.y = y * gridSizey;
		}
	}
	
	// Objects init - camera light
	light = new THREE.PointLight(0xffffff, 1, 50);
	light.position.set(0,0,4);
	scene.add(light);
	camera.position.z = 5;
	
	// Start Rendering
	render();
}