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
	
	closeMenu();
});

// Keyboard Controls - key up event
$(document).keyup(function(event) {
	if ( event.which == 38 ) { // UP
		event.preventDefault();
		mUP = false;
		cameraController.ySpeed = 0.5;
	}
	if (event.which == 40) { // DOWN
		event.preventDefault();
		mDOWN = false;
		cameraController.ySpeed = -0.5;
	}
	if (event.which == 37) { // LEFT
		event.preventDefault();
		mLEFT = false;
		cameraController.xSpeed = -0.5;
	}
	if (event.which == 39) { // RIGHT
		event.preventDefault();
		mRIGHT = false;
		cameraController.xSpeed = 0.5;
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
	if (cameraController.camera.position.z >= 35) {
		cameraController.Pan(intersect.position.x, intersect.position.y, undefined, undefined, 1.5, true, true, TWEEN.Easing.Cubic.InOut);
		cameraController.Zoom(camZ2Init-10, undefined, 1.5, true, false);
	} else {
		var spawned = true;
		var clickedBuilding = dataController.GetByID(parseInt(intersect.name));
		if (clickedBuilding.js_trigger) {
			te('map-clicks','client-clicked',clickedBuilding.js_trigger);
			spawned = !typeof SpawnAndGoToCity(clickedBuilding.js_trigger) === 'undefined';
			if (!spawned) keywordReturn(clickedBuilding.js_trigger);
		}
		boxid = parseInt(intersect.name);
		if (spawned || clickedBuilding.js_trigger) window.location.href = "#/" + clickedBuilding.overlay + '/' + clickedBuilding.slug + "/" + clickedBuilding.type;
	}
}

function mouseCursor(cursorType) {
	var c = $('canvas');
	switch (cursorType) {
		case 'grab': c.css( { 'cursor': 'grab', 'cursor': '-webkit-grab' } ); break;
		case 'grabbing': c.css( { 'cursor': 'grabbing', 'cursor': '-webkit-grabbing' } ); break;
		case 'point': c.css( { 'cursor': 'pointer' } ); break;
		case 'normal': default: c.css( { 'cursor': 'default' } ); break;
	}
}

function renderMouseListener() {
	if (!mTouchDown && !overlay && !cameraController.animating) {
		raycaster.setFromCamera(mouse, camera);
		var intersects = raycaster.intersectObjects(scene.children);
		if ( intersects.length > 0 ) {
			if (typeof intersects[0] !== 'undefined') {
				if (typeof intersects[0].face !== 'undefined') {
					if ((intersects[0].face.a == 5 && intersects[0].face.b == 7) || (intersects[0].face.a == 7 && intersects[0].face.b == 2)) {
						mouseCursor('point');
					} else {
						mouseCursor('grab');
					}
				}
			}
		}
	}
}

function fingerMouseDown(e) {
	e.preventDefault();
	cameraController.xSpeed = 0;
	cameraController.ySpeed = 0;
	mTouchDown = true;
	didSingleClick = true;
	if (isMobile && e.touches.length < 2) {		
		var touch = e.touches[0];
		oldTouchX = touch.pageX;
		oldTouchY = touch.pageY;
		mouseMove(e);
	} else if (!isMobile) {
		oldTouchX = e.clientX;
		oldTouchY = e.clientY;
	}
	canvas.addEventListener('mousemove', fingerMouseDrag);
	canvas.addEventListener('pointermove', fingerMouseDrag);
	mouseDownTimeout = setTimeout(function(){didSingleClick = false;}, singleClickTimeout*1000);
}

function fingerMouseDrag(e) {
	e.preventDefault();
	mouseMove(e);
	var xMod, yMod, xOldMod, yOldMod, clX, clY;
	if (isMobile) { 
		var touch = e.touches[0];
		clX = touch.pageX;
		clY = touch.pageY;
	} else {
		clX = e.clientX;
		clY = e.clientY;
	}
	xMod = clX - oldTouchX;
	xOldMod = clX;
	yMod = clY - oldTouchY;
	yOldMod = clY;

	if (xMove != xMod) {
		xMove = xMod;
		oldTouchX = xOldMod;
	}
	if (yMove != yMod) {
		yMove = yMod;
		oldTouchY = yOldMod;
	}
	
	var moveSpeed = cameraController.camera.position.z / 12;
	
	mouseCursor('grabbing');
	
	yMod = yMod === 0 ? undefined : yMod / 75;
	xMod = xMod === 0 ? undefined : -xMod / 75;
	if (e.which == 3) {
		var delta = yMod * 10;
		if (cameraController.HitTestZ(cameraController.camera.position.z + delta)) {
			cameraController.Move(undefined, undefined, delta, false);
			cameraController.zSpeed = delta;
		}
	} else {
		if (!pinched) {
			cameraController.Move(xMod * moveSpeed, yMod * moveSpeed, undefined, false);
			cameraController.xSpeed = xMod * moveSpeed;
			cameraController.ySpeed = yMod * moveSpeed;
		}
	}

}

function fingerMouseUp(e) {
	e.preventDefault();
	mTouchDown = false;
	clearTimeout(mouseDownTimeout);
	canvas.removeEventListener('mousemove', fingerMouseDrag);
	canvas.removeEventListener('pointermove', fingerMouseDrag);
	
	if (xMove < 1 && xMove > -1 && yMove < 1 && yMove > -1 && !pinched && didSingleClick) {
		raycaster.setFromCamera(mouse, camera);
		var intersects = raycaster.intersectObjects(scene.children);

		if ( intersects.length > 0 ) {
			if (typeof intersects[0] !=='undefined') {
				if (typeof intersects[0].face !== 'undefined') {
					if ((intersects[0].face.a == 5 && intersects[0].face.b == 7) || (intersects[0].face.a == 7 && intersects[0].face.b == 2)) boxClicked(intersects[0].object);
					else if (cameraController.camera.position.z >= 35 && intersects[0].object.position.z != groundZ) boxClicked(intersects[0].object);
				}
			}
		}
	}
	
	mouseCursor();
	
	xMove = 0;
	yMove = 0;
	didSingleClick = false;
	mUP = false;
	mDOWN = false;
	mRIGHT = false;
	mDOWN = false;
	oldScale = 0;
	pinched = false;
	touchFinish = true;
}

function rightClick(e) {
	
}

function mouseMove(e) {
	e.preventDefault();
	var headerHeight = $('header').height();
	if (isMobile) {
		mouse.x = (e.touches[0].pageX / $(canvasDiv).width()) * 2 - 1;
		mouse.y = - ((e.touches[0].pageY - headerHeight) / $(canvasDiv).height()) * 2 + 1;
	} else {
		mouse.x = (e.clientX / $(canvasDiv).width()) * 2 - 1;
		mouse.y = - ((e.clientY - headerHeight) / $(canvasDiv).height()) * 2 + 1;
	}
}

function zoomHandler(e) { 
	e.preventDefault();
	//Tilt
	if (e.shiftKey) {
		var delta = Math.max(-0.02, Math.min(0.02, (e.wheelDelta || -e.detail)));
		cameraController.Rotate(delta, undefined, undefined, false);
	//Zoom
	} else if (e.ctrlKey) {
		var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
		if (cameraController.HitTestZ(cameraController.camera.position.z - delta)) {
			cameraController.Zoom(-delta);
			cameraController.zSpeed = -delta;
		}
	} else {
		var deltax = Math.max(-10, Math.min(10, (e.wheelDeltaX || -e.detail))); //e.wheelDeltaX;
		var deltay = Math.max(-10, Math.min(10, (e.wheelDeltaY || -e.detail))); //e.wheelDeltaY;
		cameraController.Move(-deltax/25, deltay/25, undefined, false);
	}
	
}

function resetPinches() {
	
	var deltaHistory = [];
	var oldScale = 0;
	var delta = 0;
	
	$(document).on("pinchstart", function(e) {
		pinched = true;
		oldScale = e.scale;
	});
	
	$(document).on("pinchmove", function(e) {
		delta = (e.scale - oldScale) * -10;
		oldScale = e.scale;
		
		if (cameraController.HitTestZ(cameraController.camera.position.z + delta)) {
			cameraController.Move(undefined, undefined, delta, false);
			cameraController.zSpeed = delta;
		}
	});
	
	$(document).on("pinchend", function(e) {
		$(document).off("pinchstart pinchmove pinchend");
		resetPinches();
	});

}

resetPinches();

function setupEventListeners() {

	//Microsoft Events
	canvas.addEventListener('pointerup', fingerMouseUp);
	canvas.addEventListener("pointerdown", fingerMouseDown);
	
	//Touchy Events
	canvas.addEventListener('touchstart', fingerMouseDown);
	canvas.addEventListener('touchend', fingerMouseUp);
	canvas.addEventListener('touchmove', fingerMouseDrag);
	
	//Regular Events
	canvas.addEventListener('mouseup', fingerMouseUp);
	canvas.addEventListener("mousemove", mouseMove);
	canvas.addEventListener('mousedown', fingerMouseDown);
	
	// Mouse Wheel Zoom (Standards)
	canvas.addEventListener("mousewheel", zoomHandler);
	// Mouse Wheel Zoom (Firefox)
	canvas.addEventListener("DOMMouseScroll", zoomHandler);
	
	
	enableOnScreenController();
	
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
	
	if (mTouchDown || cameraController.animating || touchFinish) {
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

function enableOnScreenController() {
	if (isMobile) {
		$('#controls').css('display', 'none');
	} else {	
		$('#controls img').on('dragstart', function(event) { event.preventDefault(); });
		
		$('#mapctrl-left').mousedown(function() {
			mLEFT = true;
			te('on-screen-controls', 'move-left-clicked');
			$(this).mousemove(function(e) {
				e.preventDefault();
				mLEFT = false;
			});
		}).mouseup(function() {
			mLEFT = false;
			cameraController.xSpeed = -0.5;
		});
		$('#mapctrl-right').mousedown(function() {
			mRIGHT = true;
			te('on-screen-controls', 'move-right-clicked');
			$(this).mousemove(function(e) {
				e.preventDefault();
				mRIGHT = false;
			});
		}).mouseup(function() {
			mRIGHT = false;
			cameraController.xSpeed = 0.5;
		});
		$('#mapctrl-up').mousedown(function() {
			mUP = true;
			te('on-screen-controls', 'move-up-clicked');
			$(this).mousemove(function(e) {
				e.preventDefault();
				mUP = false;
			});
		}).mouseup(function() {
			mUP = false;
			cameraController.ySpeed = 0.5;
		});
		$('#mapctrl-down').mousedown(function() {
			mDOWN = true;
			te('on-screen-controls', 'move-down-clicked');
			$(this).mousemove(function(e) {
				e.preventDefault();
				mDOWN = false;
			});
		}).mouseup(function() {
			mDOWN = false;
			cameraController.ySpeed = -0.5;
		});
		$('#mapctrl-zoomin').mousedown(function() {
			mGOOUT = true;
			te('on-screen-controls', 'zoom-in-clicked');
			$(this).mousemove(function(e) {
				e.preventDefault();
				mGOOUT = false;
			});
		}).mouseup(function() {
			mGOOUT = false;
			if (cameraController.HitTestZ(cameraController.camera.position.z - 0.4)) cameraController.zSpeed = -0.4;
		});
		$('#mapctrl-zoomout').mousedown(function() {
			mGOIN = true;
			te('on-screen-controls', 'zoom-out-clicked');
			$(this).mousemove(function(e) {
				e.preventDefault();
				mGOIN = false;
			});
		}).mouseup(function() {
			mGOIN = false;
			cameraController.zSpeed = 0.4;
		});
		
		$('#mapctrl-tilt').click(function(e) {
			te('on-screen-controls', 'tilt-clicked');
			e.preventDefault();
			var currentTilt = cameraController.rotation.x;
			var camMinTilt = cameraController.constraints.R1;
			var camMidTilt = (cameraController.constraints.R1 + cameraController.constraints.R2) / 2;
			var camMaxTilt = cameraController.constraints.R2;
			if (currentTilt >= camMinTilt && currentTilt < camMidTilt) {
				cameraController.Rotate(camMidTilt, undefined, undefined, true, true);
			} else if (currentTilt >= camMidTilt && currentTilt < camMaxTilt) {
				cameraController.Rotate(camMaxTilt, undefined, undefined, true, true);
			} else {
				cameraController.Rotate(camMinTilt, undefined, undefined, true, true);
			}
		});
	}
}