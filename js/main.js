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
var cameraController = null;
var dataController = new objs.dataController();

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
		var newX = xMove ? -(xMove/200) : 0.1;
		if (mLEFT && !xMove) newX *= -1;
		var newY = yMove ? yMove/200 : 0.1;
		if (mDOWN && !yMove) newY *= -1;
		
		if (mLEFT || mRIGHT || xMove) cameraController.PanX(newX, undefined, undefined, false);
		if (mUP || mDOWN || yMove) cameraController.PanY(newY, undefined, undefined, false);

		if (mGOIN) cameraController.Zoom(0.1);
		if (mGOOUT) cameraController.Zoom(-0.1);
		if (mROTUP) cameraController.Rotate(0.03, undefined, undefined, false);
		if (mROTDOWN) cameraController.Rotate(-0.03, undefined, undefined, false);
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
	light = new THREE.PointLight(0xffffff, 1, 100);
	light.position.set(0,0,8);
	scene.add(light);
	camera.position.z = camZStart;
	cameraController = new objs.cameraController(camera, light);
	setupEventListeners();

	//Objects init - city, delay until data is populated
	initInterval = setInterval(function() {
		if (glCards.length > 0) {
			clearInterval(initInterval);
			
			//set Data
			dataController.SetData(glCards);
			
			//spawn city
			cityController.SpawnCity(buildingsPerRow, buildingsPerColumn, "", 0, 0, glCards);
			
			//center camera on city
			cameraController.CenterOnCity(cityController.city, true);
			
			//zoom camera
			cameraController.Zoom(camZEnd, undefined, camZAnimationTime, true, false);
		}
	}, 500);
	
	// Start Rendering
	render();
}

/*setTimeout(function() {
	var city = cityController.SpawnCity(buildingsPerRow, buildingsPerColumn, "test", 10, 10, glCards);
	cityController.SetCity(city);
	cameraController.CenterOnCity(city);
}, 3000);*/
