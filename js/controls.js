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
	var clickedBuilding = dataController.GetByID(parseInt(intersect.name));
	var newdoctitle = clickedBuilding.title + " - " + clickedBuilding.description + " || Red Lion {REDEFINE}";
	document.title = newdoctitle;
	window.history.pushState({"pageTitle":newdoctitle}, newdoctitle, "#/" + clickedBuilding.slug + "/" + clickedBuilding.type);
}

window.onpopstate = function(e){
    if(e.state){
        document.title = e.state.pageTitle;
    } else {
	    document.title = "Red Lion {REDEFINE}";
    }
};

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
	didSingleClick = true;
	mouseDownTimeout = setTimeout(function(){didSingleClick = false;}, singleClickTimeout*1000);
	canvas.addEventListener('mousemove', fingerMouseDrag);
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

	if (xMove != xMod) {
		xMove = xMod;
		oldTouchX = xOldMod;
	}
	if (yMove != yMod) {
		yMove = yMod;
		oldTouchY = yOldMod;
	}

	yMod = yMod === 0 ? undefined : yMod / 250;
	xMod = xMod === 0 ? undefined : -xMod / 250;
	cameraController.Move(xMod, yMod, undefined, false);

}

function fingerMouseUp(e) {
	e.preventDefault();
	clearTimeout(mouseDownTimeout);
	
	canvas.removeEventListener('mousemove', fingerMouseDrag);
	
	var touchX, touchY, vector;
	
	if (xMove < 1 && xMove > -1 && yMove < 1 && yMove > -1 && !pinched && didSingleClick) {
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
		vector.unproject( cameraController.camera );
		raycaster.set( cameraController.camera.position, vector.sub( cameraController.camera.position ).normalize() );
		var intersects = raycaster.intersectObjects(objects);
		
		if ( intersects.length > 0 ) boxClicked(intersects[0].object);
	}
	xMove = 0;
	yMove = 0;
	mUP = false;
	mDOWN = false;
	mRIGHT = false;
	mDOWN = false;
	mTouchDown = false;
	oldScale = 0;
	pinched = false;
}

function zoomHandler(e) {
	var delta = Math.max(-0.1, Math.min(0.1, (e.wheelDelta || -e.detail)));
	cameraController.Zoom(-delta * 2);
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

		cameraController.Zoom(delta > 0 ? -0.4 : 0.4);
	});
	
	$(document).on("pinchend", function(e) {
		oldScale = 0;
		pinched = false;
		$(document).off("pinchstart pinchmove pinchend");
		resetPinches();
	});

}

resetPinches();

function setupEventListeners() {
	if (debug) console.log("event listeners are initializing...");
	var canvases = document.getElementsByTagName('canvas');
	canvas = canvases[0];
	
	// Touch Events - Start (Finger/Mouse down)
	canvas.addEventListener('touchstart', fingerMouseDown);
	canvas.addEventListener('mousedown', fingerMouseDown);

	// Touch Events - End (Finger/Mouse up)
	canvas.addEventListener('touchend', fingerMouseUp);
	canvas.addEventListener('mouseup', fingerMouseUp);

	// Touch Events - Move (Finger/Mouse drag)
	canvas.addEventListener('touchmove', fingerMouseDrag);
	
	// Mouse Wheel Zoom (Standards)
	canvas.addEventListener("mousewheel", zoomHandler);
	// Mouse Wheel Zoom (Firefox)
	canvas.addEventListener("DOMMouseScroll", zoomHandler);
	
	// Check if Acceleromoter is present and start event listener
	if (window.DeviceMotionEvent) {
		window.addEventListener('devicemotion', devMoveHandler, false);
	}

	onMouseLeftBrowserWindow(function(e) {
		didSingleClick = false;
		clearTimeout(mouseDownTimeout);
		fingerMouseUp(e);
	});
}

// Acceleration Vars
var acc_oldaz = null;
var acc_az = 0;
var acc_arAlpha = 0;
var acc_arBeta = 0;
var acc_speed = 5;

var acc_fromx = null;
var acc_tox = null;
var acc_fromy = null;
var acc_toy = null;
var acc_totilt = null;
var acc_fromtilt = null;

var devMoveHandler = function(event) {
	// Get Accelerometer Information needed
	
	if (acc_fromx === null) acc_fromx = cameraController.camera.position.x;
	if (acc_tox === null) acc_tox= cameraController.camera.position.x;
	if (acc_fromy === null) acc_fromy = cameraController.camera.position.y;
	if (acc_toy === null) acc_toy = cameraController.camera.position.y;
	if (acc_totilt === null) acc_totilt = cameraController.camera.rotation.x;
	if (acc_fromtilt === null) acc_fromtilt = cameraController.camera.rotation.x;
	
	var rR = event.rotationRate;
	if (rR !== null) {
		//arAlpha measures upward movement/rotation
		//Positive Up Negative Down
		acc_arAlpha = rR.alpha;
		if (!isiOS) acc_arAlpha = acc_arAlpha * 40;
		 
		//arBeta measures side to side movement/rotation
		//Positive Left Negative Right
		acc_arBeta = rR.beta;
		if (!isiOS) acc_arBeta = acc_arBeta * 40;
		 
		//arGamma measures z axis rotation, left/right movement when flat(?)
		//Positive Left Negative Right
		//arGamma = rR.gamma;
	}
	
	if (mTouchDown) {
		acc_toy = acc_fromy = cameraController.camera.position.y;
		acc_tox = acc_fromx = cameraController.camera.position.x;
	} else {
		// Move Left & Right
		// Rotation Rate Beta changes
		// OR Rotation Rate Gamma Changes when Z > 9
		acc_fromx = camera.position.x;
		if (Math.abs(acc_arBeta) > 10) {
			var acc_moveBeta = -acc_arBeta/45;
			acc_tox = acc_fromx + acc_moveBeta;
		}

		// Move Up and Down
		// Rotation Rate Alpha changes
		// AND Y & Z stays the same (ish)
		acc_fromy = camera.position.y;
		if (Math.abs(acc_arAlpha) > 10) {
			var acc_moveAlpha = acc_arAlpha/25;
			acc_toy = acc_fromy + acc_moveAlpha;
		}

		cameraController.Move((acc_tox - acc_fromx) / acc_speed, (acc_toy - acc_fromy) / acc_speed, undefined, false);
	}
	
	// ay/az controls the tilt of the "city"
	acc_az = Math.abs(event.accelerationIncludingGravity.z * 1);
	if (acc_oldaz === null) acc_oldaz = acc_az;
	// Tilt
	// Y changes in reverse to Z.
	acc_fromtilt = camera.rotation.x;
	if (acc_az > acc_oldaz + 0.5 || acc_az < acc_oldaz - 0.5) {
		acc_totilt = (acc_az - 3) * 0.09;
		acc_oldaz = acc_az;
	}

	cameraController.Rotate((acc_totilt - acc_fromtilt) / (acc_speed * 2), undefined, undefined, false);
	
};

function onMouseLeftBrowserWindow(fn) {
	addEvent(document, "mouseout", function(e) {
		e = e ? e : window.event;
		var from = e.relatedTarget || e.toElement;
		if (!from || from.nodeName == "HTML") {
			fn(e);
		}
	});
}

function addEvent(obj, evt, fn) {
    if (obj.addEventListener) {
        obj.addEventListener(evt, fn, false);
    }
    else if (obj.attachEvent) {
        obj.attachEvent("on" + evt, fn);
    }
}



