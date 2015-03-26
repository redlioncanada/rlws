// @codekit-prepend "lib/jquery-2.1.3.min.js","lib/velocity.min.js","lib/slick.min.js","lib/pinch.min.js","lib/angular.min.js","lib/angular-route.min.js","lib/angular-resource.min.js","lib/angular-animate.min.js","lib/math.min.js","lib/tween.min.js","lib/fuse.min.js","detector.js","layout.js","objects.js","options.js","app.js,"controls.js";

// Three.JS/WebGL init vars
var canvasDiv = $('#canvas');
var canvas = canvasDiv.get(0);
var camera = new THREE.PerspectiveCamera( camFOVStart, canvasDiv.width()/canvasDiv.height(), 1, 300 );
var scene = new THREE.Scene();
var mouse = new THREE.Vector2(), intersected;
var raycaster = new THREE.Raycaster();
//scene.fog = new THREE.FogExp2( 0x000000, 0.06 );
var renderer = new THREE.WebGLRenderer({antialias: true});
var spotLight = new THREE.SpotLight( 0xffffff );
var hemilight = null;
var lightintensity = 40;
var composer;

var initInterval;
var objects = [];
var objs = new _objects();
var dataController = new objs.dataController();
var cityController = new objs.cityController(dataController);
var cameraController = null;
var fuse; //search library
var controlsinit = false;
var plane;

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
	
	var newTime = new Date().getTime() / 1000;
	frameTime = newTime - currentTime;
	currentTime = newTime;
	totalTime += frameTime;

	//apply camera movement
	if (!overlay) {
		var newX = xMove ? -(xMove/200) : 0.1;
		if (mLEFT && !xMove) newX *= -1;
		var newY = yMove ? yMove/200 : 0.1;
		if (mDOWN && !yMove) newY *= -1;
		if (mLEFT || mRIGHT) cameraController.Move(newX, undefined, undefined, false);
		if (mUP || mDOWN) cameraController.Move(undefined, newY, undefined, false);

		if (mGOIN) cameraController.Zoom(0.1);
		if (mGOOUT) cameraController.Zoom(-0.1);
		if (mROTUP) cameraController.Rotate(0.03, undefined, undefined, false);
		if (mROTDOWN) cameraController.Rotate(-0.03, undefined, undefined, false);
		
		//renderer.render( scene, camera );
		composer.render( 0.1 );
	}
}

function init3D() {
	if (Detector.webgl) {
		resize();
		
		//Always after resize
		composer = new THREE.EffectComposer( renderer );
		var renderPass = new THREE.RenderPass( scene, camera );
		composer.addPass(renderPass);
		
		//var effectFilm = new THREE.FilmPass(0.8, 0.1, 1024, false);
		//composer.addPass(effectFilm);
		var vignettePass = new THREE.ShaderPass( THREE.VignetteShader );
		vignettePass.uniforms[ "darkness" ].value = 1.5;
		composer.addPass(vignettePass);
		
		//Always Last
		var effectCopy = new THREE.ShaderPass(THREE.CopyShader);
		effectCopy.renderToScreen = true;
		composer.addPass(effectCopy);

		
		var explosionTexture = new THREE.ImageUtils.loadTexture( 'testcloud.png' );
        var explosionMaterial = new THREE.MeshBasicMaterial( { map: explosionTexture } );
        explosionMaterial.transparent = true;
        var cube2Geometry = new THREE.PlaneBufferGeometry( 64, 64, 1, 1 );
        cube2 = new THREE.Mesh( cube2Geometry, explosionMaterial );
        cube2.position.set(15,14,50);
        scene.add(cube2);
		
		// Objects init - plane (ground)
		var geometry = new THREE.PlaneBufferGeometry( 10000, 10000 );
		var material = new THREE.MeshBasicMaterial( {color: 0x000, side: THREE.DoubleSide} );
		plane = new THREE.Mesh( geometry, material );
		scene.add( plane );
		plane.position.z = 12;
		
		var loader = new THREE.ObjectLoader();

		loader.load('models/rllogo2.json', function (object) {
			scene.add(object);
			object.position.set(-300,-90,80);
			object.scale.set(0.5,0.5,0.5);
		});
		
		spotLight.position.set( 0, 40, 80 );
		spotLight.target.position.set(40,0,0);
		spotLight.intensity = 0.8;
		
		spotLight.castShadow = true;
		spotLight.shadowDarkness = 0.3;
		
		spotLight.shadowMapWidth = 1024;
		spotLight.shadowMapHeight = 1024;
		
		spotLight.shadowCameraNear = 10;
		spotLight.shadowCameraFar = 40000;
		spotLight.shadowCameraFov = 30;
		
		scene.add( spotLight );
		
		// Objects init - camera & light
		hemilight = new THREE.HemisphereLight(0x98c3cd, 0xfffdf2, 0.3);
		scene.add(hemilight);
		cameraController = new objs.cameraController(renderer,scene,camera);

		//Objects init - city, delay until data is populated
		initInterval = setInterval(function() {
			if (glCards.length > 0) {
				clearInterval(initInterval);

				//set Data
				dataController.SetData(glCards);
				
				setTimeout(function() {
					//banish the loading screen to the netherrealms
					$('#loading').fadeOut();
					//spawn city
					SpawnAndGoToCity(homeKeyword);
				}, 1000);
			}
		}, 500);
		
		// Start Rendering
		render();
	}
}

function SpawnAndGoToCity(tag) {
	if (typeof abs === 'undefined') abs = false;
	var spawned = cityController.CityIsSpawned(tag);
	if (!spawned) {
		if (tag == homeKeyword) {
			var data = layout;
			var city = cityController.SpawnCity(tag, data, 1);
		} else {
			var data = dataController.GetAllWithTag(tag);
			if (!data || !(data.length)) return undefined;
			var city = cityController.SpawnCity(tag, data);
		}
	} else {
		var city = cityController.GetCityByTag(tag);
	}

	if ((data && (data.length || Object.keys(data).length)) || spawned) {
		cityController.SetCity(city);
		cameraController.CenterOnCity(city);
		return city;
	} else {
		return undefined;
	}
}

// @@codekit-append "js/ui.js";
