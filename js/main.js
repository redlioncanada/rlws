var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);

// Three.JS/WebGL init vars
var camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 10000 );
var scene = new THREE.Scene();
scene.fog = new THREE.FogExp2( 0xfffdf2, 0.18 );
var renderer = new THREE.WebGLRenderer({antialias: true});
var light = null;

var initInterval;
var objects = [];

var objs = new _objects();
var cityController = new objs.cityController();
var cameraController = new objs.cameraController();

// Render init
renderer.shadowMapEnabled = true;
resize();
document.body.appendChild( renderer.domElement );
$(window).on('resize', resize);

function resize() {
	renderer.setSize( window.innerWidth, window.innerHeight );	
}

function render() {
	requestAnimationFrame( render );
	TWEEN.update();
	
	//apply camera movement
	if (!overlay) {
		if (!xMove && mRIGHT) cameraController.Move(0.1, undefined, undefined, false);
		if (!xMove && mLEFT) cameraController.Move(-0.1, undefined, undefined, false);
		if (!yMove && mUP) cameraController.Move(undefined, 0.1, undefined, false);
		if (!yMove && mDOWN) cameraController.Move(undefined, -0.1, undefined, false);
		if (mGOIN) cameraController.Zoom(0.1);
		if (mGOOUT) cameraController.Zoom(-0.1);
		if (xMove && (mLEFT || mRIGHT)) cameraController.Move(-(xMove/200), undefined, undefined, false);
		if (yMove && (mUP || mDOWN)) cameraController.Move(undefined, yMove/200, undefined, false);
		if (mROTUP && camera.rotation.x < 0.9) {
			cameraController.Rotate(0.03, undefined, undefined, false);
		}
		if (mROTDOWN && camera.rotation.x > 0) {
			cameraController.Rotate(-0.03, undefined, undefined, false);
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
	
	//Objects init - city, delay until data is populated
	initInterval = setInterval(function() {
		if (glCards.length > 0) {
			clearInterval(initInterval);
			
			//spawn city
			cityController.SpawnCity(buildingsPerRow, buildingsPerColumn, 0, 0, glCards);
			
			//set camera constraints
			var constraintX1 = -cityController.city.extents.X1-camXExtents;
			var constraintY1 = -cityController.city.extents.Y1-camYExtents;
			var constraintZ1 = -cityController.city.extents.Z1-camZ1Extents;
			var constraintX2 = cityController.city.extents.X2+camXExtents;
			var constraintY2 = cityController.city.extents.Y2+camYExtents;
			var constraintZ2 = cityController.city.extents.Z2+camZ2Extents;
			cameraController.SetConstraints(constraintX1, constraintY1, constraintZ1, camRotateMin, constraintX2, constraintY2, constraintZ2, camRotateMax);
			
			//center camera on city
			cameraController.CenterOnCity(cityController.city);
			
			//zoom camera
			cameraController.Zoom(camZEnd, undefined, camZAnimationTime, true);
		}
	}, 500);
	
	// Start Rendering
	render();
}
