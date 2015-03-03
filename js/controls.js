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
	
	if (Math.abs(camera.position.y) <= Math.abs(originY-camY2Extents) && yMod < 0 || // mDOWN = false;
		Math.abs(camera.position.y) >= Math.abs(originY+camY1Extents) && yMod > 0) //mUP = false;
	{
		animations.CameraMove(undefined, yMod/250);
	}
	if (Math.abs(camera.position.x) <= Math.abs(originX-camX1Extents) && xMod > 0 || // mLEFT = false;
	Math.abs(camera.position.x) >= Math.abs(originX+camX2Extents) && xMod < 0) // mRIGHT = false;
	{
		animations.CameraMove(-xMod/250, undefined);
	}
}

function fingerMouseUp(e) {
	e.preventDefault();
	
	canvas.removeEventListener('mousemove', fingerMouseDrag);
	
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
		}
		else if (camera.position.z > camMinHeight && delta > 0) {
			camera.position.z -= 0.1;
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

function setupEventListeners() {
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
	
	// Mouse Wheel Zoom
	canvas.addEventListener("mousewheel", zoomHandler);
}

// Acceleration Vars
var ay = 0;
var oldaz = null;
var az = 0;
var arAlpha = 0;
var arBeta = 0;
var arGamma = 0;
var camTween = null;
var camTweening = false;
var camTiltTweening = false;
var speed = 3;

/*
var onClipEvent(load){
_x=0;
_y=0;
speed=2;
}
onClipEvent(mouseDown){
targetx=_root._xmouse;
targety=_root._ymouse;
}
onClipEvent(enterFrame){
_x+=(targetx-_x)/speed;
_y+=(targety-_y)/speed;
}
*/

var devMoveHandler = function(event) {
	// Get Accelerometer Information needed
	
	rR = event.rotationRate;
	if (rR !== null) {
		//arAlpha measures upward movement/rotation
		//Positive Up Negative Down
		arAlpha = rR.alpha;
		if (!isiOS) arAlpha = arAlpha * 40;
		 
		//arBeta measures side to side movement/rotation
		//Positive Left Negative Right
		arBeta = rR.beta;
		if (!isiOS) arBeta = arBeta * 40;
		 
		//arGamma measures z axis rotation, left/right movement when flat(?)
		//Positive Left Negative Right
		//arGamma = rR.gamma;
	}

	// ay/az controls the tilt of the "city"
	az = Math.abs(event.accelerationIncludingGravity.z * 1);
	if (oldaz === null) oldaz = az;
	
	// Move Left & Right
	// Rotation Rate Beta changes
	// OR Rotation Rate Gamma Changes when Z > 9
	var moveBeta;
	if (Math.abs(arBeta) > 10) moveBeta = -arBeta/250; //animations.CameraMoveTweened(-arBeta/250, undefined, 0.5);
	else moveBeta = 0;
	
	// Move Up and Down
	// Rotation Rate Alpha changes
	// AND Y & Z stays the same (ish)
	var moveAlpha;
	if (Math.abs(arAlpha) > 10) moveAlpha = arAlpha/150; //animations.CameraMoveTweened(undefined, arAlpha/250, 0.5);
	else moveAlpha = 0;
	
	if (moveAlpha !== 0 || moveBeta !== 0) {
		var fromx = camera.position.x;
		var fromy = camera.position.y;
		var tox = fromx + moveBeta;
		var toy = fromy + moveAlpha;
		
		camera.position.x += (tox - fromx) / speed;
		camera.position.y += (toy - fromy) / speed;
		
		/*
		var tween = new TWEEN.Tween({x : fromx, y : fromy})
			.to({x : fromx+moveBeta, y : fromy+moveAlpha}, event.interval * 4)
			.easing( TWEEN.Easing.Linear.None )
			.onUpdate(function() {
				camera.position.x = this.x;
				camera.position.y = this.y;
			})
			.onComplete(function() {
				camTweening = false;
			})
			.start();
		*/
	}
	
	// Tilt
	// Y changes in reverse to Z.
	if (az > oldaz || az < oldaz)
	{
		var totilt = az * 0.09;
		var fromtilt = camera.rotation.x;
		
		camera.rotation.x += (totilt - fromtilt) / speed;
		
		/*
		var tilttween = new TWEEN.Tween({x : fromtilt})
			.to({x : totilt}, event.interval * 8)
			.easing( TWEEN.Easing.Linear.None )
			.onUpdate(function() {
				camera.rotation.x = this.x;
			})
			.onComplete(function() {
				camTiltTweening = false;
			})
			.start();
		*/
	}
	
	oldaz = az;
	
};


// Check if Acceleromoter is present and start event listener
if (window.DeviceMotionEvent) {
	window.addEventListener('devicemotion', devMoveHandler, false);
}