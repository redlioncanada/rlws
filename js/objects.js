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
	//End Data Controller
	
	//Camera Controller - maintains camera animation
	this.cameraController = function(camera) {
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
			R1 : camRotateMax,
			R2 : camRotateMin
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
		
		if (typeof X !== 'undefined') {
			if ((this.HitTestX(X) && !this.animating) || !constrain || abs) {
				this.camera.position.x = X;
			}
		}
		if (typeof Y !== 'undefined') {
			if ((this.HitTestY(Y) && !this.animating) || !constrain || abs) {
				this.camera.position.y = Y;
			}
		}
		if (typeof Z !== 'undefined') {
			if ((this.HitTestZ(Z) && !this.animating) || !constrain || abs) {
				this.camera.position.z = Z;
			}
		}
		
		if (debug && debugMovement) console.log('Move: X:'+X+',Y:'+Y+',Z:'+Z);
	};
	
	this.cameraController.prototype.Rotate = function(X, Y, Z, abs) {
		if (typeof abs === 'undefined') abs = true;
		if (!abs) {
			X = this.camera.position.x+X;
			Y = this.camera.position.x+Y;
			Z = this.camera.position.x+Z;
		}
		
		if (typeof X !== 'undefined') {
			if (this.HitTestR(X) && !this.animating) {
				this.camera.rotation.x = X;
			}
		}
		if (typeof Y !== 'undefined') {
			if (this.HitTestR(Y) && !this.animating) {
				this.camera.rotation.y = Y;
			}
		}
		if (typeof Z !== 'undefined') {
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

	this.cityController.prototype.SpawnCity = function(buildingsPerRow, buildingsPerColumn, tag, rawData, sizeMultiplier, startX, startY) {
		if (typeof sizeMultiplier === 'undefined') sizeMultiplier = 1;
		if (typeof startX === 'undefined') startX = this.cities.length === 0 ? 0 : this.cities.length*this.cities[0].width*cityGutter;
		if (typeof startY === 'undefined') startY = 0;
		
		/*if (sizeMultiplier > 1) {
			//multiply the size of the array
			var newData = self.MultiplyArray(sizeMultiplier, rawData);
			buildingsPerRow *= sizeMultiplier;
			buildingsPerColumn *= sizeMultiplier;

			//insert the original ordered array into the new array, preventing duplicates in the center
			var mXStart = Math.floor((buildingsPerRow*sizeMultiplier)/2 - buildingsPerRow/2);
			var mXEnd = buildingsPerRow*sizeMultiplier - mXStart;
			var mYStart = Math.floor((buildingsPerColumn*sizeMultiplier)/2 - buildingsPerColumn/2);
			var mYEnd = buildingsPerRow*sizeMultiplier - mXStart;

			var cnt = 0, br = false;
			for (var i = mXStart; i <= mXEnd - 1; i++) {
				for (var j = mYStart; j <= mYEnd - 1; j++) {
					newData[i*j] = rawData[cnt];
					cnt++;

					if (cnt == rawData.length-1) br = true;
					if (br) break;
				}
				if (br) break;
			}

			rawData = newData;
		}*/

		var c = new self.city(buildingsPerRow, buildingsPerColumn, rawData, sizeMultiplier, startX, startY);
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
	this.city = function(bpr, bpc, rawData, sizeMultiplier, sX, sY) {
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
		this.buildingData = rawData.slice();
		this.extents = {X1:undefined,Y1:undefined,X2:undefined,Y2:undefined,Z1:undefined,Z2:undefined};
		this.origin = {X:sX,Y:sY};
		this.width = 0;
		this.height = 0;
		this.midpoint = {X:0,Y:0};
		this.buildingsPerRow = bpr;
		this.buildingsPerColumn = bpc;
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
			
				//skip this draw index if the current tile will extend into an occupied index
				var _br = false, cont = false;
				for (var i = 0; i < curBuilding.xsize; i++) {
					for (var j = 0; j < curBuilding.ysize; j++) {
						if (y+j-1 < this.buildingsPerColumn && this.buildingsPerRow-x+i < this.buildingsPerRow) {
							if (this.drawMatrix.subset(math.index(y+j-1,this.buildingsPerRow-x+i)) > 0) {
								console.log("found tile extending into occupied index");
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
				var curBoxDepth = (Math.random() * 3) + 1;
				if (curBoxDepth / 2 + 1 > camMinHeight) camMinHeight = Math.ceil(curBoxDepth / 2 + 1);
			
				thisbox.geometry = new THREE.BoxGeometry( curBoxWidth, curBoxHeight, curBoxDepth );
				var useColor = parseInt(curBuilding.hex_color,16);
				
				var tex = new THREE.ImageUtils.loadTexture( curBuilding.img );
				tex.wrapS = THREE.RepeatWrapping;
				tex.wrapT = THREE.RepeatWrapping;
				var repeatx;
				var repeaty;
				if (curBuilding.xsize == 1) tex.repeat.x = 358/512;
				else if (curBuilding.xsize == 2) tex.repeat.x = 691/1024;
				if (curBuilding.ysize == 1) tex.repeat.y = 435/512;
				else if (curBuilding.ysize == 2) tex.repeat.y = 947/1024;
				tex.offset.y = 1.0 - tex.repeat.y;
				
				//tex.repeat.y = 100 / 2000;
				//tex.offset.x = ( 300 / 100 ) * tex.repeat.x;
				//tex.offset.y = ( 400 / 100 ) * tex.repeat.y;
				
				thisbox.material = [
					new THREE.MeshLambertMaterial( {color: useColor }),
					new THREE.MeshLambertMaterial( {color: useColor }),
					new THREE.MeshLambertMaterial( {color: useColor }),
					new THREE.MeshLambertMaterial( {color: useColor }),
					new THREE.MeshLambertMaterial( {map: tex}),
					new THREE.MeshLambertMaterial( {color: useColor })
				];
				thisbox.material[4].minFilter = THREE.NearestFilter;
				thisbox.cube = new THREE.Mesh( thisbox.geometry, new THREE.MeshFaceMaterial(thisbox.material) );
				thisbox.cube.name = curBuilding.id;
				scene.add( thisbox.cube );
				thisbox.cube.position.x = this.origin.X + (-x * gridSizex - ((-(curBuilding.xsize - 1) * gridSizex) / 2) + jitterxBool);
				thisbox.cube.position.y = this.origin.Y + (-y * gridSizey - (((curBuilding.ysize - 1) * gridSizey) / 2) + jitteryBool);
				
				//console.log(this.extents.X1+","+this.extents.X2+","+this.extents.Y1+","+this.extents.Y2);
				if (thisbox.cube.position.x + curBoxWidth*1.4 < this.extents.X1 || typeof this.extents.X1 != 'number') this.extents.X1 = thisbox.cube.position.x + curBoxWidth*1.4;
				if (thisbox.cube.position.x - curBoxWidth*1.4 > this.extents.X2 || typeof this.extents.X2 != 'number') this.extents.X2 = thisbox.cube.position.x - curBoxWidth*1.4; 
				if (thisbox.cube.position.y + curBoxHeight/4 < this.extents.Y1 || typeof this.extents.Y1 != 'number') this.extents.Y1 = thisbox.cube.position.y + curBoxHeight/4;
				if (thisbox.cube.position.y - curBoxHeight/4 > this.extents.Y2 || typeof this.extents.Y2 != 'number') this.extents.Y2 = thisbox.cube.position.y - curBoxHeight/4; 
				if (thisbox.cube.position.z - curBoxDepth/2 < this.extents.Z1 || typeof this.extents.Z1 != 'number') this.extents.Z1 = thisbox.cube.position.z + curBoxDepth/3;
				
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