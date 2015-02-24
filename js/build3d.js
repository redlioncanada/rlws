// Rudimentary Controls with keyboard vars
var mUP = false;
var mDOWN = false;
var mRIGHT = false;
var mLEFT = false;
var mGOIN = false;
var mGOOUT = false;
var mROTUP = false;
var mROTDOWN = false;

var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);

// Three.JS/WebGL init vars
var camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 10000 );
var scene = new THREE.Scene();
scene.fog = new THREE.FogExp2( 0xfffdf2, 0.18 );
var renderer = new THREE.WebGLRenderer({antialias: true});
var light = null;

var camMaxHeight = 6.5;
var camMinHeight;

// Boxes vars
var objects = [];

// Boxes options 
var gridSizex = 1.2;
var gridSizey = 1.5;
var maxX = 6;
var maxY = 6;
var boxheight = 1.3;
var boxwidth = 1;
var gutterX = gridSizex-boxwidth;
var gutterY = gridSizey-boxheight;
var jitterX = 0.05;
var jitterY = 0.4;
var colors = [0xe1251d,0x3ba6c3];

// Boxes vars
var objects = [];

// Touch Events vars
var oldTouchX = 0;
var oldTouchY = 0;
var xMove = 0;
var yMove = 0;
var mTouchDown = false;
var mTouchMove = false;
var overlay = false;
var oldScale = 0;
var pinched = false;

var initInterval;

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
	$('#blackout').on('click touchend', function(e) {
		$(this).animate({'opacity': 0}, 500, function() {
			$('#blackout').css({'display':'none'});
			overlay = false;
		});
		$(this).unbind('click');
	});
}

function fingerMouseDown(e) {
	e.preventDefault();
	if (isMobile) {
		if (e.touches.length == 2) {
			console.log(e.touches);
		} else {
			var touch = e.touches[0];
			oldTouchX = touch.pageX;
			oldTouchY = touch.pageY;
		}
	} else {
		oldTouchX = e.clientX;
		oldTouchY = e.clientY;
	}
	mTouchDown = true;
}

function fingerMouseDrag(e) {
	e.preventDefault();
	if (isMobile) { 
		var touch = e.touches[0];
		xMove = touch.pageX - oldTouchX;
		oldTouchX = touch.pageX;
		yMove = touch.pageY - oldTouchY;
		oldTouchY = touch.pageY;
	} else if (mTouchDown) {
		xMove = e.clientX - oldTouchX;
		oldTouchX = e.clientX;
		yMove = e.clientY - oldTouchY;
		oldTouchY = e.clientY;
	}
}

function fingerMouseUp(e) {
	e.preventDefault();
	
	var touchX, touchY, vector;
	
	if (isMobile) {
		touchX = ( e.pageX / window.innerWidth ) * 2 - 1;
		touchY = -( e.pageY / window.innerHeight ) * 2 + 1;
		vector = new THREE.Vector3( touchX, touchY, 0.5 );		
	} else {	
		touchX = ( e.clientX / window.innerWidth ) * 2 - 1;
		touchY = -( e.clientY / window.innerHeight ) * 2 + 1;
		vector = new THREE.Vector3( touchX, touchY, 0.5 );
	}	
	if (xMove < 1 && xMove > -1 && yMove < 1 && yMove > -1 && !pinched) {
		var raycaster = new THREE.Raycaster();
		vector.unproject( camera );
		raycaster.set( camera.position, vector.sub( camera.position ).normalize() );
		var intersects = raycaster.intersectObjects(objects);
		
		if ( intersects.length > 0 ) boxClicked(intersects[0].object);
	}
	xMove = 0;
	yMove = 0;
	mTouchDown = false;
	oldScale = 0;
	pinched = false;
}

function zoomHandler(e) {
	var delta = Math.max(-0.1, Math.min(0.1, (e.wheelDelta || -e.detail)));
	if ((camera.position.z > camMinHeight && delta > 0) || (camera.position.z < camMaxHeight && delta < 0)) camera.position.z -= delta;
}

function resetPinches() {

	$(document).on("pinchstart", function(e) {
		oldScale = 0;
		pinched = true;
	});
	
	$(document).on("pinchmove", function(e) {
		pinched = true;
		var delta = e.scale - oldScale;
		oldScale = e.scale;
		if (camera.position.z < camMaxHeight && delta < 0) {
			camera.position.z += 0.1;
			console.log("zoom out, delta: " + delta);
		}
		else if (camera.position.z > camMinHeight && delta > 0) {
			camera.position.z -= 0.1;
			console.log("zoom in, delta: " + delta);
		}
	});
	
	$(document).on("pinchend", function(e) {
		oldScale = 0;
		pinched = false;
		$(document).off("pinchstart pinchmove pinchend");
		resetPinches();
	});

}

resetPinches();

// Touch Events - Start (Finger/Mouse down)
document.addEventListener('touchstart', fingerMouseDown);
document.addEventListener('mousedown', fingerMouseDown);

// Touch Events - End (Finger/Mouse up)
document.addEventListener('touchend', fingerMouseUp);
document.addEventListener('mouseup', fingerMouseUp);

// Touch Events - Move (Finger/Mouse drag)
document.addEventListener('touchmove', fingerMouseDrag);
document.addEventListener('mousemove', fingerMouseDrag);

document.addEventListener("mousewheel", zoomHandler);

function init3D() {
	// Objects init - plane (ground)
	var geometry = new THREE.PlaneBufferGeometry( 100, 100 );
	var material = new THREE.MeshPhongMaterial( {color: 0xfffdf2, side: THREE.DoubleSide} );
	var plane = new THREE.Mesh( geometry, material );
	scene.add( plane );
	plane.position.z = -0.2;
	
	// Objects init - camera light
	light = new THREE.PointLight(0xffffff, 1, 50);
	light.position.set(0,0,4);
	scene.add(light);
	camera.position.z = 5;
	
	//delay building init until data is populated
	initInterval = setInterval(function() {
		if (glCards.length > 0) {
			clearInterval(initInterval);
			initBuildings();
		}
	}, 500);
	
	// Start Rendering
	render();
}

function initBuildings() {
	// Objects init - boxes (buildings)
	var drawMatrix = math.zeros(maxX, maxY);
	var dataMatrix = math.zeros(1, glCards.length);
	camMinHeight = 0;
	
	var cards = glCards;
	var totalCards = cards.length;
	var jitterxBool = jitterX;
	var jitteryBool = jitterY;
	var br = false;
	var ind = 0;
	for (var y = 1; y <= maxY; y++) {
		for (var x = maxX; x >= 1; x--) {
			var thisbox = {};
			var curCard = cards[ind];
			if (typeof curCard === 'undefined') {br = true; break;}
			
			//if (x == 3) {br = true; break;}
			//if the current draw matrix index is occupied, skip this index
			if (drawMatrix.subset(math.index(y-1,maxX-x)) == 1) continue;
			
			//TODO skip this draw index if the current tile will extend into an occupied index
			/*if (curCard.ysize > 1) {
				for (var i = 1; i <= curCard.xsize; i++) {
					drawMatrix.subset(math.index(y+i-1,maxX-x),1);
				}
			}*/
			//if (curCard.xsize > 1) for (var i = 1; i <= curCard.ysize; i++) {drawMatrix.subset(math.index(y-1,maxX-x+i),1);}
			
			//set the current draw index as occupied
			drawMatrix.subset(math.index(y-1,maxX-x), 1);
			
			//set the indexes the current item extends into as occupied
			var i;
			if (curCard.ysize > 1) for (i = 1; i <= curCard.xsize; i++) {drawMatrix.subset(math.index(y+i-1,maxX-x),1);}
			if (curCard.xsize > 1) for (i = 1; i <= curCard.ysize; i++) {drawMatrix.subset(math.index(y-1,maxX-x+i),1);}
			
			//set the current data index as displayed/occupied
			dataMatrix.subset(math.index(0, totalCards-cards.length), 1);
			cards = cards.splice(ind, 1);
			
			jitterxBool *= -1;
			jitteryBool *= -1;
			var curBoxHeight = (gutterY*(curCard.ysize-1)) + boxheight*curCard.ysize;
			var curBoxWidth = (gutterX*(curCard.xsize-1)) + boxwidth*curCard.xsize;
			var curBoxDepth = (Math.random() * 3) + 1;
			if (curBoxDepth / 2 + 1 > camMinHeight) camMinHeight = Math.ceil(curBoxDepth / 2 + 1);
			
			thisbox.geometry = new THREE.BoxGeometry( curBoxWidth, curBoxHeight, curBoxDepth );
			var useColor = colors[Math.round(Math.random())];
			thisbox.material = [
				new THREE.MeshLambertMaterial( {color: useColor }),
				new THREE.MeshLambertMaterial( {color: useColor }),
				new THREE.MeshLambertMaterial( {color: useColor }),
				new THREE.MeshLambertMaterial( {color: useColor }),
				new THREE.MeshLambertMaterial( {map: THREE.ImageUtils.loadTexture(curCard.img)}),
				new THREE.MeshLambertMaterial( {color: useColor })
			];
			thisbox.material[4].minFilter = THREE.NearestFilter;
			thisbox.cube = new THREE.Mesh( thisbox.geometry, new THREE.MeshFaceMaterial(thisbox.material) );
			thisbox.cube.name = ind;
			scene.add( thisbox.cube );
			objects.push(thisbox.cube);
			thisbox.cube.position.x = -x * gridSizex - (((curCard.xsize - 1) * gridSizex) / 2) + jitterxBool;
			thisbox.cube.position.y = -y * gridSizey - (((curCard.ysize - 1) * gridSizey) / 2) + jitteryBool;

			//logMatrix(dataMatrix);
			//logMatrix(drawMatrix);
			if (br) break;
		}
		if (br) break;
	}
	console.log("camera max: " + camMaxHeight + " min: " + camMinHeight);
}

function logMatrix(drawMatrix) {
	for (var arr in drawMatrix) {
		for (var index in arr) {
			console.log(drawMatrix[arr][index]);
		}
	}
}