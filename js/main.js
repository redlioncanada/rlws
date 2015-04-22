// "lib/jquery-2.1.3.min.js","lib/velocity.min.js","lib/slick.min.js","lib/pinch.min.js","lib/angular.min.js","lib/angular-route.min.js","lib/angular-resource.min.js","lib/angular-animate.min.js","lib/math.min.js","lib/tween.min.js","lib/fuse.min.js","detector.js","layout.js","objects.js","options.js","app.js,"controls.js";

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
spotLight.offset = spotlightOffset;
var mouseSpot = new THREE.SpotLight( 0xffffff, 0.9, 20, 1 );
var hemilight = null;
var lightintensity = 40;
var composer;
var hblurPass, vblurPass;

var initInterval;
var objects = [];
var objs = new _objects();
var dataController = new objs.dataController();
var cityController = new objs.cityController(dataController,camera);
var indicator = new objs.indicator(camera);
var cameraController = null;
var fuse; //search library
var controlsinit = false;
var plane;
var loopCount = 0;

function spinfunction() {
	loopCount++;
	var rotateAmount = loopCount * 180;
	$('#loadinglogo').velocity({rotateZ:rotateAmount},{duration: 1200});
}
spinfunction();
var brentSpinner = setInterval(spinfunction, 1600);


// Render init
renderer.shadowMapEnabled = true;
$(window).on('resize', resize);
document.addEventListener('orientationchange', resize);
function resize() {
	var width = canvasDiv.width(), height = canvasDiv.height();
	camera.sceneWidth = width;
	camera.sceneHeight = height;
	camera.aspect = width / height;
	renderer.setSize(width, height);
	camera.updateProjectionMatrix();
	if (cameraController) cameraController.Update();
}

function render() {
	
	renderMouseListener();
	
	TWEEN.update();
	
	cameraController.AfterRelease();

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
		
		composer.render( 0.1 );
		requestAnimationFrame( render );
	}

	//update spotlight position
	function translate(a) {return (a*50)/100*0.3;}
	if (!isMobile) {
		var mouseX = camera.position.x + camera.width * translate(mouse.x);
		var mouseY = camera.position.y + camera.height * translate(mouse.y);
	} else {
		var mouseX = camera.position.x;
		var mouseY = camera.position.y;
	}
	var mouseZ = cityController.city ? cityController.city.extents.Z2 : 0;
	var offsetY = 7, offsetX = 6;
	mouseSpot.position.set(mouseX-offsetX, mouseY-offsetY, mouseZ);
	mouseSpot.target.position.set(mouseX+offsetX, mouseY+offsetY, 0);
	mouseSpot.updateMatrixWorld();
	mouseSpot.target.updateMatrixWorld();

	cameraController.Update();
	indicator.Update();
}


function init3D() {
	if (Detector.webgl) {
		resize();
		
		//Always after resize
		composer = new THREE.EffectComposer( renderer );
		var renderPass = new THREE.RenderPass( scene, camera );
		composer.addPass(renderPass);
		
		var vignettePass = new THREE.ShaderPass( THREE.VignetteShader );
		vignettePass.uniforms[ "darkness" ].value = 1.5;
		composer.addPass(vignettePass);
		
		hblurPass = new THREE.ShaderPass( THREE.HorizontalBlurShader );
		hblurPass.uniforms['h'].value = 0;
		composer.addPass(hblurPass);
		vblurPass = new THREE.ShaderPass( THREE.VerticalBlurShader );
		vblurPass.uniforms['v'].value = 0;
		composer.addPass(vblurPass);
		
		//Always Last
		var effectCopy = new THREE.ShaderPass(THREE.CopyShader);
		effectCopy.renderToScreen = true;
		composer.addPass(effectCopy);

		// CLOUDS!!!1!
		var cloudTexture = new THREE.ImageUtils.loadTexture( 'img/cloud1.png' );
        var cloudMaterial = new THREE.MeshBasicMaterial( { map: cloudTexture } );
        cloudMaterial.transparent = true;
        var cloudGeometry = new THREE.PlaneBufferGeometry( 64, 64, 1, 1 );
        
        var cloudTexture2 = new THREE.ImageUtils.loadTexture( 'img/cloud2.png' );
        var cloudMaterial2 = new THREE.MeshBasicMaterial( { map: cloudTexture2 } );
        cloudMaterial2.transparent = true;
        
        var cloudTexture3 = new THREE.ImageUtils.loadTexture( 'img/cloud3.png' );
        var cloudMaterial3 = new THREE.MeshBasicMaterial( { map: cloudTexture3 } );
        cloudMaterial3.transparent = true;
        
        var cloud1 = new THREE.Mesh( cloudGeometry, cloudMaterial3 );
        cloud1.position.set(16,16,30);
        scene.add(cloud1);
        
        var cloud2 = new THREE.Mesh( cloudGeometry, cloudMaterial2 );
        cloud2.position.set(2,0,38);
        cloud2.rotation.z = 3.5;
        scene.add(cloud2);
        
        var cloud3 = new THREE.Mesh( cloudGeometry, cloudMaterial3 );
        cloud3.position.set(30,2,45);
        scene.add(cloud3);
        
        var cloud4 = new THREE.Mesh( cloudGeometry, cloudMaterial2 );
        cloud4.position.set(30,30,50);
        scene.add(cloud4);
        
        var cloud5 = new THREE.Mesh( cloudGeometry, cloudMaterial );
        cloud5.position.set(-5,40,55);
        cloud5.rotation.z = 3.5;
        scene.add(cloud5);
        
        var cloud6 = new THREE.Mesh( cloudGeometry, cloudMaterial2 );
        cloud6.position.set(55,15,58);
        scene.add(cloud6);

		var cloud7 = new THREE.Mesh( cloudGeometry, cloudMaterial3 );
        cloud7.position.set(-25,15,61);
        scene.add(cloud7);
        
        var cloud8 = new THREE.Mesh( cloudGeometry, cloudMaterial );
        cloud8.position.set(15,50,68);
        cloud8.rotation.z = 3.5;
        scene.add(cloud8);
        
        var cloud9 = new THREE.Mesh( cloudGeometry, cloudMaterial );
        cloud9.position.set(16,-15,73);
        scene.add(cloud9);

		
		// Objects init - plane (ground)
		var geometry = new THREE.PlaneBufferGeometry( 10000, 10000 );
		var material = new THREE.MeshLambertMaterial( {color: 0x888888, side: THREE.DoubleSide} );
		plane = new THREE.Mesh( geometry, material );
		scene.add( plane );
		plane.receiveShadow = true;
		plane.position.z = groundZ;
		
		spotLight.position.set( 0, 40, 80 );
		spotLight.target.position.set(40,0,0);
		spotLight.intensity = 0.8;
		
		spotLight.castShadow = true;
		spotLight.shadowDarkness = 0.3;
		
		spotLight.shadowMapWidth = 1024;
		spotLight.shadowMapHeight = 1024;
		
		spotLight.shadowCameraNear = 10;
		spotLight.shadowCameraFar = 40000;
		spotLight.shadowCameraFov = 55;
		
		scene.add( spotLight );
		
		mouseSpot.castShadow = true;
		mouseSpot.shadowDarkness = 0.4;
		mouseSpot.shadowMapWidth = 1024;
		mouseSpot.shadowMapHeight = 1024;
		mouseSpot.shadowCameraNear = 1;
		mouseSpot.shadowCameraFar = 120;
		mouseSpot.shadowCameraFov = 55;
		mouseSpot.exponent = 5;
		mouseSpot.intensity = 1;
		mouseSpot.angle = isMobile ? 0.5 : 0.1;
		scene.add( mouseSpot );
		
		// Objects init - camera & light
		hemilight = new THREE.HemisphereLight(0x98c3cd, 0xfffdf2, 0.5);
		scene.add(hemilight);
		cameraController = new objs.cameraController(renderer,scene,camera,spotLight);
		cameraController.constrain = !disableConstraints;
		cameraController.on('outofbounds', keywordHide);

		//Objects init - city, delay until data is populated
		initInterval = setInterval(function() {
			if (glCards.length > 0) {
				clearInterval(initInterval);

				//set Data
				dataController.SetData(glCards);
				
				setTimeout(function() {
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
	if (!tag) tag = homeKeyword;
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
		if (tag == homeKeyword && !dataController.loaded) {
			dataController.on('loaded', function() {
				dataController.off('loaded', 'centeroncity');
				cameraController.CenterOnCity(city, false, zoomCallback);
			}, 'centeroncity');
		} else {
			cameraController.CenterOnCity(city, false, zoomCallback);
		}
		if (tag == homeKeyword) indicator.SetDestination(city.midpoint);
		return city;
	} else {
		return undefined;
	}

	function zoomCallback() {
		cityController.SetCity(city);
	}
}

//  "js/ui.js";
