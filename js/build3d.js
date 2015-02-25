var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);

// Three.JS/WebGL init vars
var camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 10000 );
var scene = new THREE.Scene();
scene.fog = new THREE.FogExp2( 0xfffdf2, 0.18 );
var renderer = new THREE.WebGLRenderer({antialias: true});
var light = null;

// Boxes vars
var objects = [];
var gutterX = gridSizex-boxwidth;
var gutterY = gridSizey-boxheight;
var gridTotalWidth = maxX * (gridSizex + gutterX);
var gridTotalHeight = maxY * (gridSizey + gutterY);
var initInterval;

// Render init
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMapEnabled = true;
document.body.appendChild( renderer.domElement );

function render() {
	requestAnimationFrame( render );
	TWEEN.update();
	//cube.rotation.x += 0.1;
	//cube.rotation.y += 0.1;
	
	//constrain camera position
	if (Math.abs(camera.position.y) >= Math.abs(originY-camY2Extents)) mDOWN = false;
	if (Math.abs(camera.position.y) <= Math.abs(originY+camY1Extents)) mUP = false;
	if (Math.abs(camera.position.x) >= Math.abs(originX-camX1Extents)) mLEFT = false;
	if (Math.abs(camera.position.x) <= Math.abs(originX+camX2Extents)) mRIGHT = false;
	
	if (!overlay) {
		if (mRIGHT) moveCamX(0.1);
		if (mLEFT) moveCamX(-0.1);
		if (mUP) moveCamY(0.1);
		if (mDOWN) moveCamY(-0.1);
		if (mGOIN) camera.position.z -= 0.1;
		if (mGOOUT) camera.position.z += 0.1;
		if (xMove) moveCamX((xMove/200) * -1);
		if (yMove) moveCamY(yMove/200);
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
			clearInterval(initInterval);
			initBuildings();
		}
	}, 500);
	
	// Start Rendering
	render();
}

function animateCameraZoom(from, to) {
	var tween = new TWEEN.Tween( { z : from } )
		.to( { z : to }, camZAnimationTime*1000 )
		.easing( TWEEN.Easing.Elastic.InOut )
		.onUpdate( function() {
			camera.position.z = this.z;
		})
		.start();
}

function animateCameraPosition(from, to) {
}

function initBuildings() {
	// Objects init - boxes (buildings)
	var drawMatrix = math.zeros(maxX, maxY);
	var dataMatrix = math.zeros(1, glCards.length);
	camMinHeight = 0;
	
	var cards = glCards;
	var totalCards = cards.length;
	var jitterxBool = jitterX;
	var jitteryBool = jitterY;
	var br = false;
	var ind = 0;
	for (var y = 1; y <= maxY; y++) {
		for (var x = maxX; x >= 1; x--) {
			var thisbox = {};
			var curCard = cards[ind];
			if (typeof curCard === 'undefined') {br = true; break;}
			
			//if (x == 3) {br = true; break;}
			//if the current draw matrix index is occupied, skip this index
			if (drawMatrix.subset(math.index(y-1,maxX-x)) > 0) continue;
			
			//TODO skip this draw index if the current tile will extend into an occupied index, non-issue if only drawing right/down
			
			//set the current draw index as occupied
			drawMatrix.subset(math.index(y-1,maxX-x), Math.max(curCard.xsize,curCard.ysize));
			
			//set the indexes the current item extends into as occupied
			if (curCard.ysize > 1) for (var i = 1; i <= curCard.xsize; i++) {drawMatrix.subset(math.index(y+i-1,maxX-x),Math.max(curCard.xsize,curCard.ysize));}
			if (curCard.xsize > 1) for (var i = 1; i <= curCard.ysize; i++) {drawMatrix.subset(math.index(y-1,maxX-x+i),Math.max(curCard.xsize,curCard.ysize));}
			
			//set the current data index as displayed/occupied
			dataMatrix.subset(math.index(0, totalCards-cards.length), Math.max(curCard.xsize,curCard.ysize));
			cards.splice(ind, 1);
			
			jitterxBool *= -1;
			jitteryBool *= -1;
			var curBoxHeight = (gutterY*(curCard.ysize-1)) + boxheight*curCard.ysize;
			var curBoxWidth = (gutterX*(curCard.xsize-1)) + boxwidth*curCard.xsize;
			var curBoxDepth = (Math.random() * 3) + 1;
			if (curBoxDepth / 2 + 1 > camMinHeight) camMinHeight = Math.ceil(curBoxDepth / 2 + 1);
			
			thisbox.geometry = new THREE.BoxGeometry( curBoxWidth, curBoxHeight, curBoxDepth );
			var useColor = colors[Math.round(Math.random())];
			thisbox.material = [
				new THREE.MeshLambertMaterial( {color: useColor }),
				new THREE.MeshLambertMaterial( {color: useColor }),
				new THREE.MeshLambertMaterial( {color: useColor }),
				new THREE.MeshLambertMaterial( {color: useColor }),
				new THREE.MeshLambertMaterial( {map: THREE.ImageUtils.loadTexture(curCard.img)}),
				new THREE.MeshLambertMaterial( {color: useColor })
			];
			thisbox.material[4].minFilter = THREE.NearestFilter;
			thisbox.cube = new THREE.Mesh( thisbox.geometry, new THREE.MeshFaceMaterial(thisbox.material) );
			thisbox.cube.name = totalCards-cards.length;
			scene.add( thisbox.cube );
			objects.push(thisbox.cube);
			thisbox.cube.position.x = -x * gridSizex - (((curCard.xsize - 1) * gridSizex) / 2) + jitterxBool;
			thisbox.cube.position.y = -y * gridSizey - (((curCard.ysize - 1) * gridSizey) / 2) + jitteryBool;

			logMatrix(drawMatrix);
			logMatrix(dataMatrix);
			if (br) break;
		}
		if (br) break;
	}
	
	//center camera to grid
	moveCamAbs(-(gridTotalWidth/2), -(gridTotalHeight/2));
	
	//set camera constraints
	camMinX = -gridTotalWidth-camX1Extents;
	camMaxX = 0+camX2Extents;
	camMinY = -gridTotalHeight-camY1Extents;
	camMaxY = 0+camY2Extents;
	
	originX = camera.position.x;
	originY = camera.position.y;
	
	//zoom camera
	animateCameraZoom(camera.position.z, camZEnd);
}

function logMatrix(drawMatrix) {
	for (var arr in drawMatrix) {
		for (var index in arr) {
			console.log(drawMatrix[arr][index]);
		}
	}
}