var _objects = function() {
	var self = this;
	
	//Camera Controller - maintains camera animation
	this.cameraController = function() {
		this.constraints = {X1:0,Y1:0,Z1:0,X2:0,Y2:0,Z2:0,R1:0,R2:0};
		this.origin = {X:0,Y:0};
	}
	
	this.cameraController.prototype.CenterOnCity = function(city) {
		//this.Move(-(gridTotalWidth/2), -(gridTotalHeight/2));
		this.Move(city.midpoint.X, city.midpoint.Y);
		this.SetOrigin(city.midpoint.X, city.midpoint.Y);
	};
	
	this.cameraController.prototype.SetConstraints = function(X1, Y1, Z1, R1, X2, Y2, Z2, R2) {
		if (typeof X1 !== 'undefined') this.constraints.X1 = X1;
		if (typeof Y1 !== 'undefined') this.constraints.Y1 = Y1;
		if (typeof Z1 !== 'undefined') this.constraints.Z1 = Z1;
		if (typeof R1 !== 'undefined') this.constraints.R1 = R1;
		if (typeof X2 !== 'undefined') this.constraints.X2 = X2;
		if (typeof Y2 !== 'undefined') this.constraints.Y2 = Y2;
		if (typeof Z2 !== 'undefined') this.constraints.Z2 = Z2;
		if (typeof R2 !== 'undefined') this.constraints.R2 = R2;
	}
	
	this.cameraController.prototype.SetOrigin = function(X, Y) {
		if (typeof X !== 'undefined') this.origin.X = X;
		if (typeof Y !== 'undefined') this.origin.Y = Y;
	}
	
	this.cameraController.prototype.Pan = function(toX, toY, fromX, fromY, time, abs) {
		this.PanX(fromX, toX, fromX, fromY, time, abs);
		this.PanY(fromY, toY, fromX, fromY, time, abs);
	};
	
	this.cameraController.prototype.PanX = function(to, from, time, abs) {
		if (typeof time === 'undefined') time = 0.01;
		if (typeof abs === 'undefined') abs = false;
		if (typeof from === 'undefined') from = camera.position.x;
		if (!abs) to = from + to;
		
		if (to > this.constraints.X1 && to < this.constraints.X2) {
			var t = new TWEEN.Tween( { x : from } )
				.to( { x : to }, time*1000 )
				.onUpdate( function() {
					camera.position.x = this.x;
				})
				.start();
			}
		}
	};
	
	this.cameraController.prototype.PanY = function(to, from, time, abs) {
		if (typeof time === 'undefined') time = 0.01;
		if (typeof abs === 'undefined') abs = false;
		if (typeof from === 'undefined') from = camera.position.y;
		if (!abs) to = from + to;
		
		if (to > this.constraints.Y1 && to < this.constraints.Y2) {
			var t = new TWEEN.Tween( { y : from } )
				.to( { y : to }, time*1000 )
				.onUpdate( function() {
					camera.position.y = this.y;
				})
				.start();
		}
	};
	
	this.cameraController.prototype.Zoom = function(to, from, time, abs) {
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
	
	this.cameraController.prototype.Move = function(X, Y, Z, abs) {
		if (typeof abs === 'undefined') abs = true;
		if (!abs) {
			if (typeof X !== 'undefined') {
				if (camera.position.x + X < this.constraints.X2 && camera.position.x + X > this.constraints.X1) {
					camera.position.x += X;
					light.position.x += X;
				}
			}
			if (typeof Y !== 'undefined') {
				if (camera.position.y + Y < this.constraints.Y2 && camera.position.y + Y > this.constraints.Y1) {
					camera.position.y += Y;
					light.position.y += Y;
				}
			}
			if (typeof Z !== 'undefined') {
				if (camera.position.z + Z < this.constraints.Z2 && camera.position.z + Z > this.constraints.Z1) {
					camera.position.z += Z;
				}
			}
		} else {
			if (typeof X !== 'undefined') {
				if (X < this.constraints.X2 && X > this.constraints.X1) {
					camera.position.x = X;
					light.position.x = X;
				}
			}
			if (typeof Y !== 'undefined') {
				if (Y < this.constraints.Y2 && Y > this.constraints.Y1) {
				camera.position.y = Y;
				light.position.y = Y;
			}
			if (typeof Z !== 'undefined') {
				if (Z < this.constraints.Z2 && Z > this.constraints.Z1) {
					camera.position.z = Z;
				}
			}
		}
	};
	
	this.cameraController.prototype.Rotate = function(X, Y, Z, abs) {
		if (typeof abs === 'undefined') abs = true;
		if (!abs) {
			if (typeof X !== 'undefined') camera.rotation.x += X;
			if (typeof Y !== 'undefined') camera.rotation.y += Y;
			if (typeof Z !== 'undefined') camera.rotation.z += Z;
		} else {
			if (typeof X !== 'undefined') camera.rotation.x = X;
			if (typeof Y !== 'undefined') camera.rotation.y = Y;
			if (typeof Z !== 'undefined') camera.rotation.z = Z;
		}
	};
	//End Camera Controller 
	
	//CityController - Maintains cities
	this.cityController = function() {
		this.cities = [];
		this.city = undefined;
	};

	this.cityController.prototype.SpawnCity = function(buildingsPerRow, buildingsPerColumn, startX, startY, rawData) {
		var c = new self.city(buildingsPerRow, buildingsPerColumn, startX, startY, rawData);
		this.cities.push(c);
		this.city = c
	};
	
	this.cityController.prototype.SetCityByIndex = function(index) {
		if (index <= this.cities.length) this.city = cities[index];
		else this.city = cities.length;
	};
	
	this.cityController.prototype.CityHitTestX = function(side,X) {return this.city.HitTestX(side,X);}
	this.cityController.prototype.CityHitTestY = function(side,Y) {return this.city.HitTestY(side,Y);}
	this.cityController.prototype.CityHitTestZ = function(side,Z) {return this.city.HitTestZ(side,Z);}
	//End CityController

	//City - a collection of buildings
	this.city = function(buildingPersRow, buildingsPerColumn, startX, startY, rawData) {
		this.logMatrix = function(matrix) {
			for (var arr in matrix) {
				for (var index in arr) {
					console.log(matrix[arr][index]);
				}
			}
		};
	
		this.buildings = [];
		this.buildingData = rawData.slice();
		this.extents = {X1:0,Y1:0,X2:0,Y2:0,Z1:0,Z2:0};
		this.origin = {X:0,Y:0};
		this.midpoint = {X:0,Y:0};
		this.buildingsPerRow = buildingsPerRow;
		this.buildingsPerColumn = buildingsPerColumn;
		this.init3D();
	};
	
	this.city.prototype.HitTestX = function(side,X) {return side == false ? X < this.extents.X1 : X > this.extents.X2; }
	this.city.prototype.HitTestY = function(side,Y) {return side == false ? Y < this.extents.Y1 : Y > this.extents.Y2; }
	this.city.prototype.HitTestZ = function(side,Z) {return side == false ? Z < this.extents.Z1 : Z > this.extents.Z2; }

	this.city.prototype.init3D = function() {
		var gutterX = gridSizex-boxwidth;
		var gutterY = gridSizey-boxheight;
		var jitterxBool = jitterX;
		var jitteryBool = jitterY;
	
		this.drawMatrix = math.zeros(this.buildingsPerRow, this.buildingsPerColumn);
		this.dataMatrix = math.zeros(1, this.buildingData.length);
		camMinHeight = 0;
	
		var buildingDataLength = this.buildingData.length;
		var br = false;
		var ind = 0;
	
		for (var y = 1; y <= this.buildingsPerColumn; y++) {
			for (var x = this.buildingsPerRow; x >= 1; x--) {
				var thisbox = {};
				var curBuilding = new self.building(this.buildingData[ind]);
				if (typeof curBuilding === 'undefined') {br = true; break;}
			
				//if the current draw matrix index is occupied, skip this index
				if (this.drawMatrix.subset(math.index(y-1,this.buildingsPerRow-x)) > 0) continue;
			
				//TODO skip this draw index if the current tile will extend into an occupied index, non-issue if only drawing right/down
			
				//set the current draw index as occupied
				this.drawMatrix.subset(math.index(y-1,this.buildingsPerRow-x), Math.max(curBuilding.xsize,curBuilding.ysize));
			
				//set the indexes the current item extends into as occupied
				var i;
				if (curBuilding.ysize > 1) for (i = 1; i <= curBuilding.xsize; i++) {this.drawMatrix.subset(math.index(y+i-1,this.buildingsPerRow-x),Math.max(curBuilding.xsize,curBuilding.ysize));}
				if (curBuilding.xsize > 1) for (i = 1; i <= curBuilding.ysize; i++) {this.drawMatrix.subset(math.index(y-1,this.buildingsPerRow-x+i),Math.max(curBuilding.xsize,curBuilding.ysize));}
			
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
				thisbox.cube.position.x = this.origin.X + (-x * gridSizex - ((-(curBuilding.xsize - 1) * gridSizex) / 2) + jitterxBool);
				thisbox.cube.position.y = this.origin.Y + (-y * gridSizey - (((curBuilding.ysize - 1) * gridSizey) / 2) + jitteryBool);
				
				if (thisbox.cube.position.x <= this.extents.X1) this.extents.X1 = thisbox.cube.position.x;
				if (thisbox.cube.position.x+curBoxWidth >= this.extents.X2) this.extents.X2 = thisbox.cube.position.x+curBoxWidth; 
				if (thisbox.cube.position.y <= this.extents.Y1) this.extents.Y1 = thisbox.cube.position.y;
				if (thisbox.cube.position.y+curBoxHeight >= this.extents.Y2) this.extents.Y2 = thisbox.cube.position.y+curBoxHeight; 
				if (thisbox.cube.position.z <= this.extents.Z1) this.extents.Z1 = thisbox.cube.position.z;
				if (thisbox.cube.position.z+curBoxDepth >= this.extents.Z2) this.extents.Z2 = thisbox.cube.position.z+curBoxDepth; 
				
				curBuilding.SetModel(thisbox.cube);
				objects.push(thisbox.cube);

				//this.logMatrix(this.drawMatrix);
				//this.logMatrix(this.dataMatrix);
				if (br) break;
			}
			if (br) break;
		}
		
		this.midpoint.X = (this.extents.X2 - this.extents.X1) / 2;
		this.midpoint.Y = (this.extents.Y2 - this.extents.Y1) / 2;
	};
	//End City
	
	//Building - A single content entity, holds it's 3d model as well as it's content data
	this.building = function(data) {
		if (typeof data !== 'undefined') {
			this.xsize = typeof data.xsize === 'undefined' ? undefined : data.xsize;
			this.ysize = typeof data.ysize === 'undefined' ? undefined : data.ysize;
			this.id = typeof data.id === 'undefined' ? undefined : data.id;
			this.title = typeof data.title === 'undefined' ? undefined : data.title;
			this.description = typeof data.description === 'undefined' ? undefined : data.description;
			this.tags = typeof data.tags === 'undefined' ? undefined : data.tags;
			this.img = typeof data.img === 'undefined' ? undefined : data.img;
		}
		this.model = undefined;
	};
	
	this.building.prototype.SetModel = function(obj) {
		this.model = obj;
	};
	//End Building
};