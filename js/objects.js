var _objects = function() {
	var self = this;
	
	//Static Methods
	this.MultiplyArray = function(m, data) {
		if (m < 2) return data;
		var d = data.slice();
		for (var i = 1; i <= m; i++) {
			d = d.concat(data);
		}

		return this.ShuffleArray(d);
	};

	this.ShuffleArray = function(array) {
		var currentIndex = array.length, temporaryValue, randomIndex ;
		while (0 !== currentIndex) {
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;
			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		}

		return array;
	};
	//End Static Methods

	//Data Controller - maintains global city data
	this.dataController = function(dataArray) {
		this.data = {};
		this.rawData = [];
		this.materials = {c:{},t:{}};
		this.textures = {};
		if (typeof dataArray !== 'undefined') this.SetData(dataArray);
	};

	this.dataController.prototype.GetTexture = function(b) {
		if (!(b.img in this.textures)) {
			this.textures[b.img] = new THREE.ImageUtils.loadTexture( b.img );
			this.textures[b.img].wrapS = THREE.RepeatWrapping;
			this.textures[b.img].wrapT = THREE.RepeatWrapping;
		}
		var t = this.textures[b.img];
		if (b.xsize == 1) t.repeat.x = 358/512;
		else if (b.xsize == 2) t.repeat.x = 691/1024;
		if (b.ysize == 1) t.repeat.y = 435/512;
		else if (b.ysize == 2) t.repeat.y = 947/1024;
		if (b.xsize == 1 && b.ysize == 1) t.repeat.x = 306/512;
		
		t.offset.y = 1.0 - t.repeat.y;
		return t;
	};

	this.dataController.prototype.GetMaterial = function(building, color) {
		//check for color and/or img existing
		var t = this.GetTexture(building);
		if (!(color in this.materials.c)) this.materials.c[color] = new THREE.MeshLambertMaterial( { color: color });
		if (!(building.img in this.materials.t)) this.materials.t[building.img] = new THREE.MeshLambertMaterial( { map: t });
		
		var cM = this.materials.c[color];
		var tM = this.materials.t[building.img];
		var m = [cM,cM,cM,cM,tM,cM];
		m[4].minFilter = THREE.NearestFilter;
		return m;
	};
	
	this.dataController.prototype.SetData = function(dataArray) {
		for (var dataindex = 0; dataindex < dataArray.length; dataindex++) {
			this.data[parseInt(dataArray[dataindex].id)] = dataArray[dataindex];
		}
		this.rawData = dataArray;
		this.fuse = new Fuse(this.rawData, {keys: ['tags']});
		this.fuseId = new Fuse(this.rawData, {keys: ['tags'], id: 'tags'});
	};

	this.dataController.prototype.NormalizeLayoutData = function(layout) {
		var divisor = 100, minX = 2000, minY = 2000;
		for (var i in layout.types) {
			if (layout.types[i].w < divisor) divisor = layout.types[i].w;
			if (layout.types[i].h < divisor) divisor = layout.types[i].h;
		}
		for (var i in layout.types) {
			layout.types[i].h = layout.types[i].h / divisor;
			layout.types[i].w = layout.types[i].w / divisor;  
		}
		for (var i in layout.tiles) {
			layout.tiles[i].x = layout.tiles[i].x / divisor;
			layout.tiles[i].y = layout.tiles[i].y / divisor;
			if (layout.tiles[i].x < minX) minX = layout.tiles[i].x;
			if (layout.tiles[i].y < minY) minY = layout.tiles[i].y;
		}
		for (var i in layout.tiles) {
			layout.tiles[i].x -= minX;
			layout.tiles[i].y -= minY;
		}
		return layout;
	}
	this.dataController.prototype.GetBuildingsFromTiles = function(layout) {
		var temp = [];
		for (var i in layout.tiles) {
			if (isNaN(layout.tiles[i].id)) {
				console.log("error: a tile id in layout.js is NaN, a layer in the source illustrator file was not properly named");
				temp.push(this.data[15]);
			} else if (!layout.tiles[i].id in this.data) {
				console.log("error: tile id does not exist");
				temp.push(this.data[15]);
			} else {
				temp.push(this.data[layout.tiles[i].id]);
			}
		}
		return temp;
	};
	
	this.dataController.prototype.GetByID = function(id) {
		return this.data[id];
	};
	
	this.dataController.prototype.GetBySlug = function(slug) {
		var keys = Object.keys(this.data);
		for (var tile = 0; tile < keys.length; tile++) {
			if (this.data[keys[tile]].slug == slug) return this.data[keys[tile]];
		}
	};
	
	this.dataController.prototype.GetByType = function(overlay) {
		var retArray = [];
		var keys = Object.keys(this.data);
		for (var tile = 0; tile < keys.length; tile++) {
			if (this.data[keys[tile]].overlay == overlay) retArray.push(this.data[keys[tile]]);
		}
		return retArray;
	};

	this.dataController.prototype.GetAllWithTag = function(tag) {
		return this.fuse.search(tag);
	};

	this.dataController.prototype.GetIdsWithTag = function(tag) {
		return this.fuseId.search(tag);
	};
	//End Data Controller
	
	//Camera Controller - maintains camera animation
	this.cameraController = function(renderer,scene,camera) {
		this.scene = scene;
		this.renderer = renderer;
		this.camera = camera;
		this.constraints = {X1:0,Y1:0,Z1:0,X2:0,Y2:0,Z2:0,R1:0,R2:0};
		this.origin = {X:0,Y:0};
		this.animating = false;
	};

	this.cameraController.prototype.CenterOnCity = function(city, abs) {
		if (typeof abs === 'undefined') abs = false;
		if (city == -1) {console.log('Error (cameraController.CenterOnCity): Tried to Center on an invalid city'); return 0;}
		
		//set camera constraints
		var constraints = {
			X1 : city.extents.X1-camXExtents,
			Y1 : city.extents.Y1-camYExtents,
			Z1 : city.extents.Z1-camZ1Extents,
			X2 : city.extents.X2+camXExtents,
			Y2 : city.extents.Y2+camYExtents,
			Z2 : city.extents.Z2+camZ2Extents,
			R1 : camRotateMin,
			R2 : camRotateMax
		};
		
		this.SetConstraints(constraints);
		if (abs) this.Move(city.midpoint.X, city.midpoint.Y);
		else this.Pan(city.midpoint.X, city.midpoint.Y, undefined, undefined, camPanToCityAnimationTime, true, false);
		this.SetOrigin(city.midpoint.X, city.midpoint.Y);
	};
	
	this.cameraController.prototype.SetConstraints = function(constraints) {
		if (typeof constraints.X1 !== 'undefined') this.constraints.X1 = constraints.X1;
		if (typeof constraints.Y1 !== 'undefined') this.constraints.Y1 = constraints.Y1;
		if (typeof constraints.Z1 !== 'undefined') this.constraints.Z1 = constraints.Z1;
		if (typeof constraints.R1 !== 'undefined') this.constraints.R1 = constraints.R1;
		if (typeof constraints.X2 !== 'undefined') this.constraints.X2 = constraints.X2;
		if (typeof constraints.Y2 !== 'undefined') this.constraints.Y2 = constraints.Y2;
		if (typeof constraints.Z2 !== 'undefined') this.constraints.Z2 = constraints.Z2;
		if (typeof constraints.R2 !== 'undefined') this.constraints.R2 = constraints.R2;
	};
	
	this.cameraController.prototype.SetOrigin = function(X, Y) {
		if (typeof X !== 'undefined') this.origin.X = X;
		if (typeof Y !== 'undefined') this.origin.Y = Y;
	};
	
	this.cameraController.prototype.Pan = function(toX, toY, fromX, fromY, time, abs, constrain) {
		this.PanX(toX, fromX, time, abs, constrain);
		this.PanY(toY, fromY, time, abs, constrain);
		if (debug && debugMovement) console.log('Pan: X:'+toX+',Y:'+toY);
	};

	this.cameraController.prototype.PanX = function(to, from, time, abs, constrain) {
		var _self = this;
		if (typeof time === 'undefined') time = 0.01;
		if (typeof constrain === 'undefined') constrain = true;
		if (typeof abs === 'undefined') abs = false;
		if (typeof from === 'undefined') from = this.camera.position.x;
		if (!abs) to = from + to;
		
		if ((this.HitTestX(to) && !this.animating) || !constrain) {
			if (!constrain) this.animating = true;
			var t = new TWEEN.Tween( { x : from } )
				.to( { x : to }, time*1000 )
				.onUpdate( function() {
					_self.camera.position.x = this.x;
				})
				.onComplete( function() {
					_self.animating = false;
				})
				.start();
		}
		if (debug && debugMovement) console.log('PanX:'+to);
	};
	
	this.cameraController.prototype.PanY = function(to, from, time, abs, constrain) {
		var _self = this;
		if (typeof time === 'undefined') time = 0.01;
		if (typeof constrain === 'undefined') constrain = true;
		if (typeof abs === 'undefined') abs = false;
		if (typeof from === 'undefined') from = this.camera.position.y;
		if (!abs) to = from + to;
		
		if ((this.HitTestY(to) && !this.animating) || !constrain) {
			if (!constrain) this.animating = true;
			var t = new TWEEN.Tween( { y : from } )
				.to( { y : to }, time*1000 )
				.onUpdate( function() {
					_self.camera.position.y = this.y;
				})
				.onComplete( function() {
					_self.animating = false;
				})
				.start();
		}
		if (debug && debugMovement) console.log('PanY:'+to);
	};
	
	this.cameraController.prototype.Zoom = function(to, from, time, abs, constrain) {
		var _self = this;
		if (typeof constrain === 'undefined') constrain = true;
		if (typeof time === 'undefined') time = 0.01;
		if (typeof abs === 'undefined') abs = false;
		if (typeof from === 'undefined') from = this.camera.position.z;
		if (!abs) to = from + to;
		
		if (debug && debugMovement) console.log('Zoom: '+to);
		if ((this.HitTestZ(to) && !this.animating) || !constrain) {
			if (!constrain) this.animating = true;
			var t = new TWEEN.Tween( { z : from } )
				.to( { z : to }, time*1000 )
				.easing( TWEEN.Easing.Cubic.InOut )
				.onUpdate( function() {
					_self.camera.position.z = this.z;
				})
				.onComplete( function() {
					_self.animating = false;
				})
				.start();
		}
	};
	
	this.cameraController.prototype.Move = function(X, Y, Z, abs, constrain) {
		if (typeof constrain === 'undefined') constrain = true;
		if (typeof abs === 'undefined') abs = true;
		if (!abs) {
			X = this.camera.position.x+X;
			Y = this.camera.position.y+Y;
			Z = this.camera.position.z+Z;
		}

		if (typeof X !== 'undefined' && !isNaN(X)) {
			if ((this.HitTestX(X) && !this.animating) || !constrain || abs) {
				this.camera.position.x = X;
			}
		}
		if (typeof Y !== 'undefined' && !isNaN(Y)) {
			if ((this.HitTestY(Y) && !this.animating) || !constrain || abs) {
				this.camera.position.y = Y;
			}
		}
		if (typeof Z !== 'undefined' && !isNaN(Z)) {
			if ((this.HitTestZ(Z) && !this.animating) || !constrain || abs) {
				this.camera.position.z = Z;
			}
		}
		
		if (debug && debugMovement) console.log('Move: X:'+X+',Y:'+Y+',Z:'+Z);
	};
	
	this.cameraController.prototype.Rotate = function(X, Y, Z, abs) {
		
		if (typeof abs === 'undefined') abs = true;
		if (!abs) {
			X = this.camera.rotation.x+X;
			Y = this.camera.rotation.y+Y;
			Z = this.camera.rotation.z+Z;
		}

		if (typeof X !== 'undefined' && !isNaN(X)) {
			if (this.HitTestR(X) && !this.animating) {
				this.camera.rotation.x = X;
			}
		}
		if (typeof Y !== 'undefined' && !isNaN(Y)) {
			if (this.HitTestR(Y) && !this.animating) {
				this.camera.rotation.y = Y;
			}
		}
		if (typeof Z !== 'undefined' && !isNaN(Z)) {
			if (this.HitTestR(Z) && !this.animating) {
				this.camera.rotation.z = Z;
			}
		}
		
		
		if (debug && debugMovement) console.log('Rotate: X:'+X+',Y:'+Y+',Z:'+Z);
	};
	
	this.cameraController.prototype.HitTestX = function(X) {return X >= this.constraints.X1 && X <= this.constraints.X2; };
	this.cameraController.prototype.HitTestY = function(Y) {return Y >= this.constraints.Y1 && Y <= this.constraints.Y2; };
	this.cameraController.prototype.HitTestZ = function(Z) {return Z >= this.constraints.Z1 && Z <= this.constraints.Z2; };
	this.cameraController.prototype.HitTestR = function(R) {return R >= this.constraints.R1 && R <= this.constraints.R2; };
	//End Camera Controller 
	
	//CityController - Maintains cities
	this.cityController = function(d) {
		this.cities = [];
		this.city = undefined;
		this.dataController = d;
	};

	this.cityController.prototype.SpawnCity = function(buildingsPerRow, buildingsPerColumn, tag, rawData, sizeMultiplier, startX, startY, type) {
		if (typeof sizeMultiplier === 'undefined') sizeMultiplier = 1;
		if (typeof type === 'undefined') type = 0;
		if (typeof startX === 'undefined') startX = this.cities.length === 0 ? 0 : this.cities.length*this.cities[0].width*cityGutter;
		if (typeof startY === 'undefined') startY = 0;

		if (sizeMultiplier > 1) {
			//multiply the size of the array
			var newData = self.MultiplyArray(sizeMultiplier, rawData);
			buildingsPerRow *= sizeMultiplier;
			buildingsPerColumn *= sizeMultiplier;

			rawData = newData;
		}

		var c = new self.city(buildingsPerRow, buildingsPerColumn, dataController, rawData, sizeMultiplier, startX, startY, type);
		c.tag = tag;
		this.cities.push(c);
		c.index = this.cities.length;
		if (this.cities.length == 1) this.city = c;
		return c;
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

	this.cityController.prototype.CityIsSpawned = function(tag) {
		return this.GetCityByTag(tag) !== 0;
	};
	
	this.cityController.prototype.SetCityByIndex = function(index) {
		if (index <= this.cities.length) this.city = cities[index];
		else this.city = cities.length;
	};
	
	this.cityController.prototype.SetCityByTag = function(tag) {
		var city = this.GetCityByTag(tag);
		if (city) {this.city = city; return 1;}
		return 0;
	};

	this.cityController.prototype.GetCityByID = function(id) {
		if (id < this.cities.length) return this.cities[id];
		else return city;
	};

	this.cityController.prototype.GetCityByTag = function(tag) {
		if (typeof tag === 'string') {
			for (var index in this.cities) {
				if (typeof this.cities[index].tag !== 'undefined') {
					if (this.cities[index].tag == tag) {
						return this.cities[index];
					}
				}
			}
		}
		return 0;
	};
	//End CityController

	//City - a collection of buildings
	this.city = function(bpr, bpc, dC, rawData, sizeMultiplier, sX, sY, type) {
		if (typeof type === 'undefined') type = 0;
		this.logMatrix = function(matrix) {
			if (!debug) return;
			for (var arr in matrix) {
				for (var index in arr) {
					console.log(matrix[arr][index]);
				}
			}
		};
	
		this.index = undefined;
		this.tag = "default";
		this.buildings = [];
		this.buildingData = type ? rawData : rawData.slice();
		this.extents = {X1:undefined,Y1:undefined,X2:undefined,Y2:undefined,Z1:undefined,Z2:undefined};
		this.origin = {X:sX,Y:sY};
		this.width = 0;
		this.height = 0;
		this.midpoint = {X:0,Y:0};
		this.buildingsPerRow = bpr;
		this.buildingsPerColumn = bpc;
		this.dataRef = dC;
		if (!type) this.init3DRandomized();
		else this.init3DExplicit();
	};

	this.city.prototype.init3DExplicit = function() {
		camMinHeight = 0;

		this.layoutData = dataController.NormalizeLayoutData(this.buildingData);
		this.buildingData = dataController.GetBuildingsFromTiles(this.layoutData);

		for (var y = 0; y <= this.buildingData.length-1; y++) {
				var thisbox = {};
				var curBuilding = new self.building(this.buildingData[y]);
				if (typeof curBuilding === 'undefined') {console.log('warning: tried to spawn invalid building)'); continue;}

				var type = this.layoutData.tiles[y].type;
				var curBoxHeight = this.layoutData.types[type].h;
				var curBoxWidth = this.layoutData.types[type].w;
				var curBoxDepth = (Math.random() * buildingHeightVariance) + 1*boxdepth*10;
				if (curBoxDepth / 2 + 1 > camMinHeight) camMinHeight = Math.ceil(curBoxDepth / 2 + 1);
			
				thisbox.geometry = new THREE.BoxGeometry( curBoxWidth, curBoxHeight, curBoxDepth );
				var useColor = parseInt(curBuilding.hex_color,16);
				thisbox.material = this.dataRef.GetMaterial(curBuilding, useColor);
				thisbox.cube = new THREE.Mesh( thisbox.geometry, new THREE.MeshFaceMaterial(thisbox.material) );
				thisbox.cube.castShadow = true;
				thisbox.cube.receiveShadow = true;
				thisbox.cube.name = curBuilding.id;
				scene.add( thisbox.cube );
				thisbox.cube.position.x = this.origin.X + this.layoutData.tiles[y].x + this.layoutData.types[type].w / 2;
				thisbox.cube.position.y = this.origin.Y + this.layoutData.tiles[y].y + this.layoutData.types[type].h / 2;

				if (thisbox.cube.position.x + curBoxWidth*1.4 < this.extents.X1 || typeof this.extents.X1 != 'number') this.extents.X1 = thisbox.cube.position.x + curBoxWidth*1.4;
				if (thisbox.cube.position.x - curBoxWidth*1.4 > this.extents.X2 || typeof this.extents.X2 != 'number') this.extents.X2 = thisbox.cube.position.x - curBoxWidth*1.4; 
				if (thisbox.cube.position.y + curBoxHeight/4 < this.extents.Y1 || typeof this.extents.Y1 != 'number') this.extents.Y1 = thisbox.cube.position.y + curBoxHeight/4;
				if (thisbox.cube.position.y - curBoxHeight/4 > this.extents.Y2 || typeof this.extents.Y2 != 'number') this.extents.Y2 = thisbox.cube.position.y - curBoxHeight/4; 
				if (thisbox.cube.position.z - curBoxDepth/2 < this.extents.Z1 || typeof this.extents.Z1 != 'number') this.extents.Z1 = thisbox.cube.position.z + curBoxDepth/3;
				
				curBuilding.SetModel(thisbox.cube);
				this.buildings[parseInt(curBuilding.id)] = curBuilding;
				objects.push(thisbox.cube);
		}

		this.midpoint.X = (this.extents.X2 + this.extents.X1) / 2;
		this.midpoint.Y = (this.extents.Y2 + this.extents.Y1) / 2;
		this.width = Math.abs(this.extents.X1 - this.extents.X2);
		this.height = Math.abs(this.extents.Y1 - this.extents.Y2);
		this.extents.Z2 = this.extents.Z1 + camZ2Extents;
	};

	this.city.prototype.init3DRandomized = function() {
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
			
				//skip this draw index if the current tile will extend into an occupied index
				var _br = false, cont = false;
				for (var i = 0; i < curBuilding.xsize; i++) {
					for (var j = 0; j < curBuilding.ysize; j++) {
						if (y+j-1 < this.buildingsPerColumn && this.buildingsPerRow-x+i < this.buildingsPerRow) {
							if (this.drawMatrix.subset(math.index(y+j-1,this.buildingsPerRow-x+i)) > 0) {
								if (debug && debugGrid) console.log("found tile extending into occupied index");
								cont = true;
								_br = true;
							}
						} else {
							_br = true;
						}
						if (_br) break;
					}
					if (_br) break;
				}
				if (cont) continue;
			
				//set the indexes the current item occupies as occupied
				for (var i = 0; i < curBuilding.xsize; i++) {
					for (var j = 0; j < curBuilding.ysize; j++) {
						if (y+j-1 < this.buildingsPerColumn && this.buildingsPerRow-x+i < this.buildingsPerRow) {
							this.drawMatrix.subset(math.index(y+j-1,this.buildingsPerRow-x+i),Math.max(curBuilding.xsize,curBuilding.ysize));
						}
					}
				}
				this.buildingData.splice(ind, 1);
			
				jitterxBool *= -1;
				jitteryBool *= -1;
				var curBoxHeight = (gutterY*(curBuilding.ysize-1)) + boxheight*curBuilding.ysize;
				var curBoxWidth = (gutterX*(curBuilding.xsize-1)) + boxwidth*curBuilding.xsize;
				var curBoxDepth = (Math.random() * buildingHeightVariance) + 1*boxdepth*10;
				if (curBoxDepth / 2 + 1 > camMinHeight) camMinHeight = Math.ceil(curBoxDepth / 2 + 1);
			
				thisbox.geometry = new THREE.BoxGeometry( curBoxWidth, curBoxHeight, curBoxDepth );
				var useColor = parseInt(curBuilding.hex_color,16);
				thisbox.material = this.dataRef.GetMaterial(curBuilding, useColor);
				thisbox.cube = new THREE.Mesh( thisbox.geometry, new THREE.MeshFaceMaterial(thisbox.material) );
				thisbox.cube.castShadow = true;
				thisbox.cube.receiveShadow = true;
				thisbox.cube.name = curBuilding.id;
				scene.add( thisbox.cube );
				thisbox.cube.position.x = this.origin.X + (-x * gridSizex - ((-(curBuilding.xsize - 1) * gridSizex) / 2) + jitterxBool);
				thisbox.cube.position.y = this.origin.Y + (-y * gridSizey - (((curBuilding.ysize - 1) * gridSizey) / 2) + jitteryBool);
				//console.log(thisbox.cube.position.x,thisbox.cube.position.y,curBoxWidth,curBoxHeight);
				if (thisbox.cube.position.x + curBoxWidth*1.4 < this.extents.X1 || typeof this.extents.X1 != 'number') this.extents.X1 = thisbox.cube.position.x + curBoxWidth*1.4;
				if (thisbox.cube.position.x - curBoxWidth*1.4 > this.extents.X2 || typeof this.extents.X2 != 'number') this.extents.X2 = thisbox.cube.position.x - curBoxWidth*1.4; 
				if (thisbox.cube.position.y + curBoxHeight/4 < this.extents.Y1 || typeof this.extents.Y1 != 'number') this.extents.Y1 = thisbox.cube.position.y + curBoxHeight/4;
				if (thisbox.cube.position.y - curBoxHeight/4 > this.extents.Y2 || typeof this.extents.Y2 != 'number') this.extents.Y2 = thisbox.cube.position.y - curBoxHeight/4; 
				if (thisbox.cube.position.z - curBoxDepth/2 < this.extents.Z1 || typeof this.extents.Z1 != 'number') this.extents.Z1 = thisbox.cube.position.z + curBoxDepth/3;
				
				curBuilding.SetModel(thisbox.cube);
				this.buildings[parseInt(curBuilding.id)] = curBuilding;
				objects.push(thisbox.cube);
				
				if (debug && debugGrid) this.logMatrix(this.drawMatrix);
				if (debug && debugGrid) this.logMatrix(this.dataMatrix);
				if (br) break;
			}
			if (br) break;
		}

		this.midpoint.X = (this.extents.X2 + this.extents.X1) / 2;
		this.midpoint.Y = (this.extents.Y2 + this.extents.Y1) / 2;
		this.width = Math.abs(this.extents.X1 - this.extents.X2);
		this.height = Math.abs(this.extents.Y1 - this.extents.Y2);
		this.extents.Z2 = this.extents.Z1 + camZ2Extents;
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