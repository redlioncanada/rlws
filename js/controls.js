var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);

// Rudimentary Controls with keyboard vars
var mUP = false;
var mDOWN = false;
var mRIGHT = false;
var mLEFT = false;
var mGOIN = false;
var mGOOUT = false;
var mROTUP = false;
var mROTDOWN = false;

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

function moveCamX(x) {
	camera.position.x += x;
	light.position.x += x;
}

function moveCamY(y) {
	camera.position.y += y;
	light.position.y += y;
}

function moveCamAbs(x,y) {
	camera.position.y = y;
	light.position.y = y;
	camera.position.x = x;
	light.position.x = x;
}

// Keyboard Controls - key down event
$(document).keydown(function( event ) {
	if ( event.which == 38 ) { // UP
		event.preventDefault();
		console.log("camy:"+Math.abs(camera.position.y)+",constrain:"+Math.abs(originY+camY1Extents));
		mUP = true;
	}
	if (event.which == 40) { // DOWN
		event.preventDefault();
		console.log("camy:"+Math.abs(camera.position.y)+",constrain:"+Math.abs(originY-camY2Extents));
		mDOWN = true;
	}
	if (event.which == 37) { // LEFT
		event.preventDefault();
		console.log("camx:"+Math.abs(camera.position.x)+",constrain:"+Math.abs(originX-camX1Extents));
		mLEFT = true;
	}
	if (event.which == 39) { // RIGHT
		event.preventDefault();
		console.log("camx:"+Math.abs(camera.position.x)+",constrain:"+Math.abs(originX+camX2Extents));
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
	var xMod, yMod, xOldMod, yOldMod;
	if (isMobile) { 
		var touch = e.touches[0];
		xMod = touch.pageX - oldTouchX;
		xOldMod = touch.pageX;
		yMod = touch.pageY - oldTouchY;
		yOldMod = touch.pageY;
	} else if (mTouchDown) {
		xMod = e.clientX - oldTouchX;
		xOldMod = e.clientX;
		yMod = e.clientY - oldTouchY;
		yOldMod = e.clientY;
	}
	
	if (camera.position.x + xMod <= camMaxX && camera.position.x + xMod >= camMinX) {
		xMove = xMod;
		oldTouchX = xOldMod;
	}
	if (camera.position.y + yMod <= camMaxY && camera.position.y + yMod >= camMinY) {
		yMove = yMod;
		oldTouchY = yOldMod;
	}
}

function fingerMouseUp(e) {
	e.preventDefault();
	
	var touchX, touchY, vector;
	
	if (xMove < 1 && xMove > -1 && yMove < 1 && yMove > -1 && !pinched) {
		if (isMobile) {
			touchX = ( e.pageX / window.innerWidth ) * 2 - 1;
			touchY = -( e.pageY / window.innerHeight ) * 2 + 1;
			vector = new THREE.Vector3( touchX, touchY, 0.5 );		
		} else {	
			touchX = ( e.clientX / window.innerWidth ) * 2 - 1;
			touchY = -( e.clientY / window.innerHeight ) * 2 + 1;
			vector = new THREE.Vector3( touchX, touchY, 0.5 );
		}	
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