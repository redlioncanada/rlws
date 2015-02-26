var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);

// Three.JS/WebGL init vars
var camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 10000 );
var scene = new THREE.Scene();
scene.fog = new THREE.FogExp2( 0xfffdf2, 0.18 );
var renderer = new THREE.WebGLRenderer({antialias: true});
var light = null;

var initInterval;
var objs = new _objects();
var cityController = new objs.cityController();
var animations = new objs.animations();

var objects = [];

// Render init
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMapEnabled = true;
document.body.appendChild( renderer.domElement );

function render() {
	requestAnimationFrame( render );
	TWEEN.update();
	
	//constrain camera position
	if (Math.abs(camera.position.y) >= Math.abs(originY-camY2Extents)) mDOWN = false;
	if (Math.abs(camera.position.y) <= Math.abs(originY+camY1Extents)) mUP = false;
	if (Math.abs(camera.position.x) >= Math.abs(originX-camX1Extents)) mLEFT = false;
	if (Math.abs(camera.position.x) <= Math.abs(originX+camX2Extents)) mRIGHT = false;
	
	if (!overlay) {
		if (!xMove && mRIGHT) animations.CameraPanX(0.1, undefined, camPanAnimationTime);
		if (!xMove && mLEFT) animations.CameraPanX(-0.1, undefined, camPanAnimationTime);
		if (!yMove && mUP) animations.CameraPanY(0.1, undefined, camPanAnimationTime);
		if (!yMove && mDOWN) animations.CameraPanY(-0.1, undefined, camPanAnimationTime);
		if (mGOIN) animations.CameraZoom(0.1);
		if (mGOOUT) animations.CameraZoom(-0.1);
		if (xMove && (mLEFT || mRIGHT)) animations.CameraPanX((xMove/200) * -1, undefined, camPanAnimationTime);
		if (yMove && (mUP || mDOWN)) animations.CameraPanY(yMove/200, undefined, camPanAnimationTime);
		if (mROTUP && camera.rotation.x < 0.9) {
			camera.rotation.x += 0.03;
		}
		if (mROTDOWN && camera.rotation.x > 0) {
			camera.rotation.x -= 0.03;
		}
		renderer.render( scene, camera );
	}
}

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
	camera.position.z = camZStart;
	
	//delay building init until data is populated
	initInterval = setInterval(function() {
		if (glCards.length > 0) {
			//center camera to grid
			var gutterX = gridSizex-boxwidth;
			var gutterY = gridSizey-boxheight;
			var gridTotalWidth = maxX * (gridSizex + gutterX);
			var gridTotalHeight = maxY * (gridSizey + gutterY);
			camera.position.y = -(gridTotalHeight/2);
			light.position.y = -(gridTotalHeight/2);
			camera.position.x = -(gridTotalWidth/2);
			light.position.x = -(gridTotalWidth/2);
	
			//set camera constraints
			camMinX = -gridTotalWidth-camX1Extents;
			camMaxX = 0+camX2Extents;
			camMinY = -gridTotalHeight-camY1Extents;
			camMaxY = 0+camY2Extents;
		
			//set camera origin
			originX = camera.position.x;
			originY = camera.position.y;
	
			//zoom camera
			animations.CameraZoom(camZEnd, undefined, camZAnimationTime, true);
			
			clearInterval(initInterval);
			cityController.SpawnCity();
		}
	}, 500);
	
	// Start Rendering
	render();
}
