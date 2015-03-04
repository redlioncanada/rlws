var _objects = function() {
	var self = this;
	
	this.dataController = function(dataArray) {
		this.data = [];
		if (typeof dataArray !== 'undefined') this.SetData(dataArray);
	};
	
	this.dataController.prototype.SetData = function(dataArray) {
		for (var dataindex = 0; dataindex < dataArray.length; dataindex++) {
			this.data[parseInt(dataArray[dataindex].id)] = dataArray[dataindex];
		}
	};
	
	this.dataController.prototype.GetByID = function(id) {
		return this.data[id];
	};
	
	//this.camera Controller - maintains this.camera animation
	this.cameraController = function(camera, light) {
		this.camera = camera;
		this.light = light;
		this.constraints = {X1:0,Y1:0,Z1:0,X2:0,Y2:0,Z2:0,R1:0,R2:0};
		this.origin = {X:0,Y:0};
	};
	
	this.cameraController.prototype.CenterOnCity = function(city, abs) {
		if (typeof abs === 'undefined') abs = false;
		if (city == -1) {console.log('Error (cameraController.CenterOnCity): Tried to Center on an invalid city'); return 0;}
		
		//set camera constraints
		var constraintX1 = city.extents.X1-camXExtents;
		var constraintY1 = city.extents.Y1-camYExtents;
		var constraintZ1 = city.extents.Z1-camZ1Extents;
		var constraintX2 = city.extents.X2+camXExtents;
		var constraintY2 = city.extents.Y2+camYExtents;
		var constraintZ2 = city.extents.Z2+camZ2Extents;
		
		this.SetConstraints(constraintX1, constraintY1, constraintZ1, camRotateMin, constraintX2, constraintY2, constraintZ2, camRotateMax);
		if (abs) this.Move(city.midpoint.X, city.midpoint.Y);
		else this.Pan(city.midpoint.X, city.midpoint.Y, undefined, undefined, camPanToCityAnimationTime, true, false);
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
	};
	
	this.cameraController.prototype.SetOrigin = function(X, Y) {
		if (typeof X !== 'undefined') this.origin.X = X;
		if (typeof Y !== 'undefined') this.origin.Y = Y;
	};
	
	this.cameraController.prototype.Pan = function(toX, toY, fromX, fromY, time, abs, constrain) {
		this.PanX(toX, fromX, time, abs, constrain);
		this.PanY(toY, fromY, time, abs, constrain);
		console.log('Pan: X:'+toX+',Y:'+toY);
	};

	this.cameraController.prototype.PanX = function(to, from, time, abs, constrain) {
		var _self = this;
		if (typeof time === 'undefined') time = 0.01;
		if (typeof constrain === 'undefined') constrain = true;
		if (typeof abs === 'undefined') abs = false;
		if (typeof from === 'undefined') from = this.camera.position.x;
		if (!abs) to = from + to;
		
		if (this.HitTestX(to) || !constrain) {
			var t = new TWEEN.Tween( { x : from } )
				.to( { x : to }, time*1000 )
				.onUpdate( function() {
					_self.camera.position.x = this.x;
					_self.light.position.x = this.x;
				})
				.start();
		}
		console.log('PanX:'+to);
	};
	
	this.cameraController.prototype.PanY = function(to, from, time, abs, constrain) {
		var _self = this;
		if (typeof time === 'undefined') time = 0.01;
		if (typeof constrain === 'undefined') constrain = true;
		if (typeof abs === 'undefined') abs = false;
		if (typeof from === 'undefined') from = this.camera.position.y;
		if (!abs) to = from + to;
		
		if (this.HitTestY(to) || !constrain) {
			var t = new TWEEN.Tween( { y : from } )
				.to( { y : to }, time*1000 )
				.onUpdate( function() {
					_self.camera.position.y = this.y;
					_self.light.position.y = this.y;
				})
				.start();
		}
		console.log('PanY:'+to);
	};
	
	this.cameraController.prototype.Zoom = function(to, from, time, abs) {
		var _self = this;
		if (typeof time === 'undefined') time = 0.01;
		if (typeof abs === 'undefined') abs = false;
		if (typeof from === 'undefined') from = this.camera.position.z;
		if (!abs) to = from + to;
		
		console.log('Zoom: '+to);
		
		if (this.HitTestZ(to)) {
			var t = new TWEEN.Tween( { z : from } )
				.to( { z : to }, time*1000 )
				.easing( TWEEN.Easing.Cubic.InOut )
				.onUpdate( function() {
					_self.camera.position.z = this.z;
				})
				.start();
		}
	};
	
	this.cameraController.prototype.Move = function(X, Y, Z, abs, constrain) {
		if (typeof constrain === 'undefined') constrain = true;
		if (typeof abs === 'undefined') abs = true;
		if (!abs) {
			X = this.camera.position.x+X;
			Y = this.camera.position.x+Y;
			Z = this.camera.position.x+Z;
		}
		
		if (typeof X !== 'undefined') {
			if (this.HitTestX(X) || !constrain || abs) {
				this.camera.position.x = X;
				this.light.position.x = X;
			}
		}
		if (typeof Y !== 'undefined') {
			if (this.HitTestY(Y) || !constrain || abs) {
				this.camera.position.y = Y;
				this.light.position.y = Y;
			}
		}
		if (typeof Z !== 'undefined') {
			if (this.HitTestZ(Z) || !constrain || abs) {
				this.camera.position.z = Z;
			}
		}
		
		console.log('Move: X:'+X+',Y:'+Y+',Z:'+Z);
	};
	
	this.cameraController.prototype.Rotate = function(X, Y, Z, abs) {
		if (typeof abs === 'undefined') abs = true;
		if (!abs) {
			X = this.camera.position.x+X;
			Y = this.camera.position.x+Y;
			Z = this.camera.position.x+Z;
		}
		
		if (typeof X !== 'undefined') {
			if (this.HitTestR(X)) {
				this.camera.rotation.x = X;
				light.position.x = X;
			}
		}
		if (typeof Y !== 'undefined') {
			if (this.HitTestR(Y)) {
				this.camera.rotation.y = Y;
				light.position.y = Y;
			}
		}
		if (typeof Z !== 'undefined') {
			if (this.HitTestR(Z)) {
				this.camera.rotation.z = Z;
			}
		}
		console.log('Rotate: X:'+X+',Y:'+Y+',Z:'+Z);
	};
	
	this.cameraController.prototype.HitTestX = function(X) {return X >= this.constraints.X1 && X <= this.constraints.X2; };
	this.cameraController.prototype.HitTestY = function(Y) {return Y >= this.constraints.Y1 && Y <= this.constraints.Y2; };
	this.cameraController.prototype.HitTestZ = function(Z) {return Z >= this.constraints.Z1 && Z <= this.constraints.Z2; };
	this.cameraController.prototype.HitTestR = function(R) {return R >= this.constraints.R1 && Z <= this.constraints.R2; };
	//End this.camera Controller 
	
	//CityController - Maintains cities
	this.cityController = function() {
		this.cities = [];
		this.city = undefined;
	};
	
	this.cityController.prototype.GetCityByTag = function(tag) {
		if (tag == "default") return -1;
		for (var index in this.cities) {
			if (typeof this.cities[index].tag !== 'undefined') {
				if (this.cities[index].tag == tag) {
					return this.cities[index];
				}
			}
		}
		return 0;
	};

	this.cityController.prototype.SpawnCity = function(buildingsPerRow, buildingsPerColumn, tag, startX, startY, rawData) {
		var c = new self.city(buildingsPerRow, buildingsPerColumn, startX, startY, rawData);
		c.tag = tag;
		this.cities.push(c);
		c.index = this.cities.length;
		if (this.cities.length == 1) this.city = c;
		return c;
	};
	
	this.cityController.prototype.SetCityByIndex = function(index) {
		if (index <= this.cities.length) this.city = cities[index];
		else this.city = cities.length;
	};
	
	this.cityController.prototype.SetCityByTag = function(tag) {
		if (typeof tag === 'string') {
			for (var index in this.cities) {
				if (typeof this.cities[index].tag !== 'undefined') {
					if (this.cities[index].tag == tag) {
						this.city = this.cities[index];
						return 1;
					}
				}
			}
		}
		return 0;
	};
	
	this.cityController.prototype.SetCity = function(city) {
		if (typeof city !== 'undefined') {
			if (city.index && city.index <= this.cities.length) {
				this.city = this.cities[city.index];
				return 1;
			}
		}
		console.log('Error (cityController.SetCity): Tried to set a city with an out of range index');
		return 0;
	};
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
	
		this.index = undefined;
		this.tag = "default";
		this.buildings = [];
		this.buildingData = rawData.slice();
		this.extents = {X1:0,Y1:0,X2:0,Y2:0,Z1:0,Z2:0};
		this.origin = {X:startX,Y:startY};
		this.midpoint = {X:0,Y:0};
		this.buildingsPerRow = buildingsPerRow;
		this.buildingsPerColumn = buildingsPerColumn;
		this.init3D();
	};

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
				var useColor = parseInt(curBuilding.hex_color,16);
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
				thisbox.cube.name = curBuilding.id;
				scene.add( thisbox.cube );
				thisbox.cube.position.x = this.origin.X + (-x * gridSizex - ((-(curBuilding.xsize - 1) * gridSizex) / 2) + jitterxBool);
				thisbox.cube.position.y = this.origin.Y + (-y * gridSizey - (((curBuilding.ysize - 1) * gridSizey) / 2) + jitteryBool);
				
				if (thisbox.cube.position.x < this.extents.X1) this.extents.X1 = thisbox.cube.position.x;
				if (thisbox.cube.position.x+curBoxWidth > this.extents.X2) this.extents.X2 = thisbox.cube.position.x+curBoxWidth; 
				if (thisbox.cube.position.y < this.extents.Y1) this.extents.Y1 = thisbox.cube.position.y;
				if (thisbox.cube.position.y+curBoxHeight > this.extents.Y2) this.extents.Y2 = thisbox.cube.position.y+curBoxHeight; 
				if (thisbox.cube.position.z < this.extents.Z1) this.extents.Z1 = thisbox.cube.position.z;
				if (thisbox.cube.position.z+curBoxDepth > this.extents.Z2) this.extents.Z2 = thisbox.cube.position.z+curBoxDepth; 
				
				curBuilding.SetModel(thisbox.cube);
				this.buildings[parseInt(curBuilding.id)] = curBuilding;
				objects.push(thisbox.cube);
				

				//this.logMatrix(this.drawMatrix);
				//this.logMatrix(this.dataMatrix);
				if (br) break;
			}
			if (br) break;
		}
		
		this.midpoint.X = (this.extents.X2 + this.extents.X1) / 2;
		this.midpoint.Y = (this.extents.Y2 + this.extents.Y1) / 2;
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
			this.hex_color = typeof data.hex_color === 'undefined' ? undefined : data.hex_color;
		}
		this.model = undefined;
	};
	
	this.building.prototype.SetModel = function(obj) {
		this.model = obj;
	};
	//End Building
};