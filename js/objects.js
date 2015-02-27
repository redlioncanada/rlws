var _objects = function() {
	var self = this;
	
	//Animations - Holds various animations to three.js objects via tween library
	this.animations = function() {};
	this.animations.prototype.CameraPan = function(toX, toY, fromX, fromY, time, abs) {
		this.CameraPanX(fromX, toX, fromX, fromY, time, abs);
		this.CameraPanY(fromY, toY, fromX, fromY, time, abs);
	};
	
	this.animations.prototype.CameraPanX = function(to, from, time, abs) {
		if (typeof time === 'undefined') time = 0.01;
		if (typeof abs === 'undefined') abs = false;
		if (typeof from === 'undefined') from = camera.position.x;
		if (!abs) to = from + to;
		var t = new TWEEN.Tween( { x : from } )
			.to( { x : to }, time*1000 )
			.onUpdate( function() {
				camera.position.x = this.x;
			})
			.start();
	};
	
	this.animations.prototype.CameraPanY = function(to, from, time, abs) {
		if (typeof time === 'undefined') time = 0.01;
		if (typeof abs === 'undefined') abs = false;
		if (typeof from === 'undefined') from = camera.position.y;
		if (!abs) to = from + to;
		var t = new TWEEN.Tween( { y : from } )
			.to( { y : to }, time*1000 )
			.onUpdate( function() {
				camera.position.y = this.y;
			})
			.start();
	};
	
	this.animations.prototype.CameraZoom = function(to, from, time, abs) {
		if (typeof time === 'undefined') time = 0.01;
		if (typeof abs === 'undefined') abs = false;
		if (typeof from === 'undefined') from = camera.position.z;
		if (!abs) to = from + to;
		var t = new TWEEN.Tween( { z : from } )
			.to( { z : to }, time*1000 )
			.easing( TWEEN.Easing.Cubic.InOut )
			.onUpdate( function() {
				camera.position.z = this.z;
			})
			.start();
	};
	//End Animations
	
	//CityController - Maintains cities
	this.cityController = function() {
		this.cities = [];
	};

	this.cityController.prototype.SpawnCity = function() {
		var c = new self.city();
		this.cities.push(c);
	};
	//End CityController

	//City - a collection of buildings
	this.city = function() {
		this.logMatrix = function(matrix) {
			for (var arr in matrix) {
				for (var index in arr) {
					console.log(matrix[arr][index]);
				}
			}
		};
	
		this.buildings = [];
		this.buildingData = null;
		this.init3D();
	};

	this.city.prototype.init3D = function() {
		var gutterX = gridSizex-boxwidth;
		var gutterY = gridSizey-boxheight;
		var jitterxBool = jitterX;
		var jitteryBool = jitterY;
	
		// Objects init - boxes (buildings)
		this.drawMatrix = math.zeros(maxX, maxY);
		this.dataMatrix = math.zeros(1, glCards.length);
		camMinHeight = 0;
	
		this.buildingData = glCards.slice();
		var buildingDataLength = this.buildingData.length;
		var br = false;
		var ind = 0;
	
		for (var y = 1; y <= maxY; y++) {
			for (var x = maxX; x >= 1; x--) {
				var thisbox = {};
				var curBuilding = new self.building(this.buildingData[ind]);
				if (typeof curBuilding === 'undefined') {br = true; break;}
			
				//if (x == 3) {br = true; break;}
				//if the current draw matrix index is occupied, skip this index
				if (this.drawMatrix.subset(math.index(y-1,maxX-x)) > 0) continue;
			
				//TODO skip this draw index if the current tile will extend into an occupied index, non-issue if only drawing right/down
			
				//set the current draw index as occupied
				this.drawMatrix.subset(math.index(y-1,maxX-x), Math.max(curBuilding.xsize,curBuilding.ysize));
			
				//set the indexes the current item extends into as occupied
				var i;
				if (curBuilding.ysize > 1) for (i = 1; i <= curBuilding.xsize; i++) {this.drawMatrix.subset(math.index(y+i-1,maxX-x),Math.max(curBuilding.xsize,curBuilding.ysize));}
				if (curBuilding.xsize > 1) for (i = 1; i <= curBuilding.ysize; i++) {this.drawMatrix.subset(math.index(y-1,maxX-x+i),Math.max(curBuilding.xsize,curBuilding.ysize));}
			
				//set the current data index as displayed/occupied
				this.dataMatrix.subset(math.index(0, buildingDataLength-this.buildingData.length), Math.max(curBuilding.xsize,curBuilding.ysize));
				this.buildingData.splice(ind, 1);
			
				jitterxBool *= -1;
				jitteryBool *= -1;
				var curBoxHeight = (gutterY*(curBuilding.ysize-1)) + boxheight*curBuilding.ysize;
				var curBoxWidth = (gutterX*(curBuilding.xsize-1)) + boxwidth*curBuilding.xsize;
				var curBoxDepth = (Math.random() * 3) + 1;
				if (curBoxDepth / 2 + 1 > camMinHeight) camMinHeight = Math.ceil(curBoxDepth / 2 + 1);
			
				thisbox.geometry = new THREE.BoxGeometry( curBoxWidth, curBoxHeight, curBoxDepth );
				var useColor = colors[Math.round(Math.random())];
				thisbox.material = [
					new THREE.MeshLambertMaterial( {color: useColor }),
					new THREE.MeshLambertMaterial( {color: useColor }),
					new THREE.MeshLambertMaterial( {color: useColor }),
					new THREE.MeshLambertMaterial( {color: useColor }),
					new THREE.MeshLambertMaterial( {map: THREE.ImageUtils.loadTexture(curBuilding.img)}),
					new THREE.MeshLambertMaterial( {color: useColor })
				];
				thisbox.material[4].minFilter = THREE.NearestFilter;
				thisbox.cube = new THREE.Mesh( thisbox.geometry, new THREE.MeshFaceMaterial(thisbox.material) );
				thisbox.cube.name = buildingDataLength-this.buildingData.length;
				scene.add( thisbox.cube );
				thisbox.cube.position.x = -x * gridSizex - (((curBuilding.xsize - 1) * gridSizex) / 2) + jitterxBool;
				thisbox.cube.position.y = -y * gridSizey - (((curBuilding.ysize - 1) * gridSizey) / 2) + jitteryBool;
				curBuilding.setTDObject(thisbox.cube);
				objects.push(thisbox.cube);

				//this.logMatrix(this.drawMatrix);
				//this.logMatrix(this.dataMatrix);
				if (br) break;
			}
			if (br) break;
		}
	};
	//End City
	
	//Building - A single content entity, holds it's 3d model as well as it's content data
	this.building = function(data) {
		console.log(data);
		if (typeof data !== 'undefined') {
			this.xsize = typeof data.xsize === 'undefined' ? undefined : data.xsize;
			this.ysize = typeof data.ysize === 'undefined' ? undefined : data.ysize;
			this.id = typeof data.id === 'undefined' ? undefined : data.id;
			this.title = typeof data.title === 'undefined' ? undefined : data.title;
			this.description = typeof data.description === 'undefined' ? undefined : data.description;
			this.tags = typeof data.tags === 'undefined' ? undefined : data.tags;
			this.img = typeof data.img === 'undefined' ? undefined : data.img;
		}
		this.TDObject = undefined;
	};
	
	this.building.prototype.setTDObject = function(obj) {
		this.TDObject = obj;
	};
};