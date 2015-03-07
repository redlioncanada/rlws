var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);
var fuse; //search library

// Three.JS/WebGL init vars
var canvasDiv = $('#canvas');
var camera = new THREE.PerspectiveCamera( 60, canvasDiv.width()/canvasDiv.height(), 1, 10000 );
var scene = new THREE.Scene();
scene.fog = new THREE.FogExp2( 0xfffdf2, 0.12 );
var renderer = new THREE.WebGLRenderer({antialias: true});
var hemilight = null;
var lightintensity = 40;

var initInterval;
var objects = [];
var objs = new _objects();
var dataController = new objs.dataController();
var cityController = new objs.cityController(dataController);
var cameraController = null;
var cloudRenderer = new objs.clouds();

// Render init
renderer.shadowMapEnabled = true;
$(window).on('resize', resize);
function resize() {
	camera.aspect = canvasDiv.width() / canvasDiv.height();
	renderer.setSize(canvasDiv.width(), canvasDiv.height());
	camera.updateProjectionMatrix();
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
		if (mLEFT || mRIGHT) cameraController.PanX(newX, undefined, undefined, false);
		if (mUP || mDOWN) cameraController.PanY(newY, undefined, undefined, false);

		if (mGOIN) cameraController.Zoom(0.1);
		if (mGOOUT) cameraController.Zoom(-0.1);
		if (mROTUP) cameraController.Rotate(0.03, undefined, undefined, false);
		if (mROTDOWN) cameraController.Rotate(-0.03, undefined, undefined, false);
		renderer.render( scene, camera );
	}
}

function init3D() {
	if (Detector.webgl) {
		resize();
		
		// Objects init - plane (ground)
		var geometry = new THREE.PlaneBufferGeometry( 10000, 10000 );
		var material = new THREE.MeshBasicMaterial( {color: 0xfffdf2, side: THREE.DoubleSide} );
		var plane = new THREE.Mesh( geometry, material );
		scene.add( plane );
		plane.position.z = -0.2;
		
		// Objects init - camera & light
		hemilight = new THREE.HemisphereLight(0x98c3cd, 0xfffdf2, 1.1);
		scene.add(hemilight);
		cameraController = new objs.cameraController(camera);

		// Controls init
		setupEventListeners();

		//Objects init - city, delay until data is populated
		initInterval = setInterval(function() {
			if (glCards.length > 0) {
				clearInterval(initInterval);
				
				//banish the loading screen to the netherrealms
				$('#loading').fadeOut();

				//set Data
				dataController.SetData(glCards);
				
				//spawn city
				var city = cityController.SpawnCity(buildingsPerRow, buildingsPerColumn, "", glCards, 2);
				camera.position.z = city.extents.Z2 * camZStart;

				//Objects init - clouds
				//cloudRenderer.Render(city.extents);

				//center camera on city
				cameraController.CenterOnCity(cityController.city, true);
				
				//zoom camera
				cameraController.Zoom(city.extents.Z2 * camZEnd, undefined, camZAnimationTime, true, false);
			}
		}, 500);
		
		// Start Rendering
		render();
	}
}

function SpawnCity(tag) {
	if (tag == homeKeyword) {
		var city = cityController.GetCityByID(0);
	} else {
		if (!cityController.CityIsSpawned(tag)) {
			var data = dataController.GetAllWithTag(tag);
			var city = cityController.SpawnCity(buildingsPerRow, buildingsPerColumn, tag, data);
		} else {
			var city = cityController.GetCityByTag(tag);
		}
	}
	cityController.SetCity(city);
	cameraController.CenterOnCity(city);
	return 1;
}