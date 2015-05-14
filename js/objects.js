Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

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
		this.textureNames = [];
		this.loadedTextures = 0;
		this.subscribers = {};
		this.loaded = false;
		if (typeof dataArray !== 'undefined') this.SetData(dataArray);
	};

	this.dataController.prototype.GetTexture = function(b) {
		if (!(b.img in this.textures)) {
			var self = this;
			this.textures[b.img] = new THREE.ImageUtils.loadTexture( b.img, undefined, function() {
				if (++self.loadedTextures >= Object.keys(self.textureNames).length) {
					self.emit('loaded');
					self.loaded = true;
				}
			}, function() {
				self.loadedTextures++;
			});
			this.textures[b.img].wrapS = THREE.RepeatWrapping;
			this.textures[b.img].wrapT = THREE.RepeatWrapping;
			this.textures[b.img].anistropy = maxAnisotropy;
		}
		var t = this.textures[b.img];
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
		m[4].generateMipmaps = false;
		m[4].minFilter = THREE.LinearFilter;
		m[4].magFilter = THREE.LinearFilter;
		return m;
	};
	
	this.dataController.prototype.SetData = function(dataArray) {
		for (var dataindex = 0; dataindex < dataArray.length; dataindex++) {
			var thisid = parseInt(dataArray[dataindex].id);
			this.data[thisid] = dataArray[dataindex];
			
			if (!(thisid in this.textureNames)) this.textureNames.push(thisid);
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
	};
	
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
		var r = [];
		var s = [];
		for (var i in this.rawData) {
			if (!this.rawData[i].tags) continue;
			if (this.rawData[i].tags.indexOf(tag) > -1 && s.indexOf(this.rawData[i].slug) == -1) {
				r.push(this.rawData[i]);
				s.push(this.rawData[i].slug);
			}
		}
		return r.length ? r : false;
	};

	this.dataController.prototype.GetIdsWithTag = function(tag) {
		return this.fuseId.search(tag);
	};

	this.dataController.prototype.on = function(e, cb, context) {
		this.subscribers[e] = this.subscribers[e] || [];
        this.subscribers[e].push({
            callback: cb,
            context: context
        });
	}

	this.dataController.prototype.off = function(e, context) {
		var i, subs, sub;
        if ((subs = this.subscribers[e])) {
            i = subs.length - 1;
            while (i >= 0) {
                sub = this.subscribers[e][i];
                if (sub.context === context) {
                    this.subscribers[e].splice(i, 1);
                }
                i--;
            }
        }
	}

	this.dataController.prototype.emit = function(e) {
		var subs, i = 0,
            args = Array.prototype.slice.call(arguments, 1);
        if ((subs = this.subscribers[e])) {
            while (i < subs.length) {
                sub = subs[i];
                sub.callback.apply(sub.context || this, args);
                i++;
            }
        }
	}
	//End Data Controller
	
	//Camera Controller - maintains camera animation
	this.cameraController = function(renderer,scene,camera,spotlight) {
		this.scene = scene;
		this.renderer = renderer;
		this.camera = camera;
		this.spotlight = spotlight;
		this.withinConstraints = true;
		this.constraints = {X1:0,Y1:0,Z1:0,X2:0,Y2:0,Z2:0,R1:0,R2:0};
		this.rotation = undefined;
		this.subscribers = {};
		this.position = undefined;
		this.extents = undefined;
		this.width = undefined;
		this.height = undefined;
		this.constrain = true;
		this.origin = {X:0,Y:0};
		this.animating = false;
		this.zoomed = false;
		this.xSpeed = 0;
		this.ySpeed = 0;
		this.zSpeed = 0;
		this.Update();
	};

	this.cameraController.prototype.CenterOnCity = function(city, abs, cb) {
		if (typeof abs === 'undefined') abs = false;
		if (city == -1 || !city) {console.log('Error (cameraController.CenterOnCity): tried to center on invalid city'); return -1;}
		
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

		var _self = this;
		if (abs) {
			this.SetConstraints(constraints);
			this.Move(city.midpoint.X, city.midpoint.Y);
			this.Zoom(city.extents.Z2 - camZEnd, undefined, undefined, true, false, undefined);
			this.withinConstraints = true;
			if (typeof cb == 'function') cb();
		} else {
			if (city.tag == homeKeyword && !this.zoomed) {
				//init
				this.zoomed = true;
				this.camera.position.z = city.extents.Z2 * camZStart;
				this.SetConstraints(constraints);
				this.Move(city.midpoint.X, city.midpoint.Y, this.camera.position.z, true, false);
				this.Zoom(city.extents.Z2 - camZEnd, undefined, camZAnimationTime, true, false, undefined, function() {
					if (!controlsinit) {
						controlsinit = true;
						setupEventListeners();
					}
					_self.withinConstraints = true;
					if (typeof cb == 'function') cb();
				});
			} else {
				//on search
				this.Zoom(city.extents.Z2/3, undefined, camZAnimationTime/4, false, false, undefined, function() {
					_self.SetConstraints(constraints);
					_self.Pan(city.midpoint.X, city.midpoint.Y, undefined, undefined, camPanToCityAnimationTime, true, false, TWEEN.Easing.Cubic.InOut, function() {
						_self.withinConstraints = true;
						_self.Zoom(city.extents.Z2 - camZEnd, undefined, camZAnimationTime/2, true, false, undefined, function() {
							if (typeof cb == 'function') cb();
						});
					});
				});
			}
		}
		this.SetOrigin(city.midpoint.X, city.midpoint.Y);

		spotLight.shadowCameraFar = city.extents.Z2 * 1.5;
	};
	
	this.cameraController.prototype.AnimateBlur = function(to, time, cb) {
		if (typeof to === 'undefined') to = 0;
		if (to > 0.003) to = 0.003;
		if (to < 0) to = 0;
		var from = vblurPass.uniforms['v'].value;
		
		var t = new TWEEN.Tween( { value : from } )
			.to( { value : to }, time*1000 )
			.easing( TWEEN.Easing.Cubic.InOut )
			.onUpdate( function() {
				vblurPass.uniforms['v'].value = this.value;
				hblurPass.uniforms['h'].value = this.value;
			})
			.onComplete( function() {
				if (typeof cb !== 'undefined') cb();
			})
			.start();
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
	
	this.cameraController.prototype.Pan = function(toX, toY, fromX, fromY, time, abs, constrain, easing, cb) {
		this.PanX(toX, fromX, time, abs, constrain, easing, cb);
		this.PanY(toY, fromY, time, abs, constrain, easing);
		if (debug && debugMovement) console.log('Pan: X:'+toX+',Y:'+toY);
	};

	this.cameraController.prototype.PanX = function(to, from, time, abs, constrain, easing, cb) {
		var _self = this;
		if (typeof time === 'undefined') time = 0.01;
		if (typeof easing === 'undefined') easing = TWEEN.Easing.Linear.None;
		if (typeof constrain === 'undefined') constrain = true;
		if (typeof abs === 'undefined') abs = false;
		if (typeof from === 'undefined') from = this.camera.position.x;
		if (!abs) to = from + to;
		
		if (((this.HitTestX(to) || !this.constrain) && !this.animating) || !constrain) {
			if (!constrain) this.animating = true;
			var t = new TWEEN.Tween( { x : from } )
				.to( { x : to }, time*1000 )
				.easing( easing )
				.onUpdate( function() {
					_self.camera.position.x = this.x;
					_self.spotlight.position.x = this.x - _self.spotlight.offset.x;
					_self.spotlight.target.position.x = this.x;
					_self.spotlight.updateMatrixWorld();
					_self.spotlight.target.updateMatrixWorld();

				})
				.onComplete( function() {
					_self.animating = false;
					if (typeof cb !== 'undefined') cb();
				})
				.start();
		}
		if (debug && debugMovement) console.log('PanX:'+to);
	};
	
	this.cameraController.prototype.PanY = function(to, from, time, abs, constrain, easing, cb) {
		var _self = this;
		if (typeof time === 'undefined') time = 0.01;
		if (typeof constrain === 'undefined') constrain = true;
		if (typeof easing === 'undefined') easing = TWEEN.Easing.Linear.None;
		if (typeof abs === 'undefined') abs = false;
		if (typeof from === 'undefined') from = this.camera.position.y;
		if (!abs) to = from + to;
		
		if (((this.HitTestY(to) || !this.constrain) && !this.animating) || !constrain) {
			if (!constrain) this.animating = true;
			var t = new TWEEN.Tween( { y : from } )
				.to( { y : to }, time*1000 )
				.easing( easing )
				.onUpdate( function() {
					_self.camera.position.y = this.y;
					_self.spotlight.position.y = this.y + _self.spotlight.offset.y;
					_self.spotlight.target.position.y = this.y;
					_self.spotlight.updateMatrixWorld();
					_self.spotlight.target.updateMatrixWorld();
				})
				.onComplete( function() {
					_self.animating = false;
					if (typeof cb !== 'undefined') cb();
				})
				.start();
		}
		if (debug && debugMovement) console.log('PanY:'+to);
	};
	
	this.cameraController.prototype.Zoom = function(to, from, time, abs, constrain, easing, cb) {
		var _self = this;
		if (typeof constrain === 'undefined') constrain = true;
		if (typeof easing === 'undefined') easing = TWEEN.Easing.Cubic.InOut;
		if (typeof time === 'undefined') time = 0.01;
		if (typeof abs === 'undefined') abs = false;
		if (typeof from === 'undefined') from = this.camera.position.z;
		if (!abs) to = from + to;
		
		if (debug && debugMovement) console.log('Zoom: '+to);
		if ((this.HitTestZ(to) && !this.animating) || !constrain) {
			if (!constrain) this.animating = true;
			var t = new TWEEN.Tween( { z : from } )
				.to( { z : to }, time*1000 )
				.easing( easing )
				.onUpdate( function() {
					_self.camera.position.z = this.z;
				})
				.onComplete( function() {
					_self.animating = false;
					//_self.zoomed = to < from;
					if (typeof cb !== 'undefined') cb();
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
			if (((this.HitTestX(X) || !this.constrain) && !this.animating) || !constrain || abs) {
				this.camera.position.x = X;
				this.spotlight.position.x = X - this.spotlight.offset.x;
				this.spotlight.target.position.x = X;
				this.spotlight.updateMatrixWorld();
				this.spotlight.target.updateMatrixWorld();
			}
		}
		if (typeof Y !== 'undefined' && !isNaN(Y)) {
			if (((this.HitTestX(Y) || !this.constrain) && !this.animating) || !constrain || abs) {
				this.camera.position.y = Y;
				this.spotlight.position.y = Y + this.spotlight.offset.y;
				this.spotlight.target.position.y = Y;
				this.spotlight.updateMatrixWorld();
				this.spotlight.target.updateMatrixWorld();
			}
		}
		if (typeof Z !== 'undefined' && !isNaN(Z)) {
			if (((this.HitTestX(Z) || !this.constrain) && !this.animating) || !constrain || abs) {
				this.camera.position.z = Z;
			}
		}
		
		if (debug && debugMovement) console.log('Move: X:'+X+',Y:'+Y+',Z:'+Z);
	};
	
	this.cameraController.prototype.Rotate = function(X, Y, Z, abs, animated, cb) {
		var _self = this;
		if (typeof abs === 'undefined') abs = true;
		if (!abs) {
			X = this.camera.rotation.x+X;
			Y = this.camera.rotation.y+Y;
			Z = this.camera.rotation.z+Z;
		}

		if (typeof X !== 'undefined' && !isNaN(X)) {
			if (this.HitTestR(X) && !this.animating) {
				if (!animated) this.camera.rotation.x = X;
				else {
					this.animating = true;
					var t = new TWEEN.Tween( { x : this.camera.rotation.x } )
						.to( { x : X }, 500 )
						.easing( TWEEN.Easing.Cubic.InOut )
						.onUpdate( function() {
							_self.camera.rotation.x = this.x;
						})
						.onComplete( function() {
							_self.animating = false;
							if (typeof cb !== 'undefined') cb();
						})
						.start();
				}

				
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
	
	this.cameraController.prototype.AfterRelease = function() {
		if (!mTouchDown && !this.animating && !pinched) {
			if (debug && debugMovement) console.log("X Speed = "+this.xSpeed+", Y Speed = "+this.ySpeed);
			var acc_speed = 1.2;
			
			this.xSpeed = this.xSpeed / acc_speed;
			
			this.ySpeed = this.ySpeed / acc_speed;
			
			this.zSpeed = this.zSpeed / acc_speed;
			var toZ = this.camera.position.z + this.zSpeed / acc_speed;
			if (!this.HitTestZ(toZ)) {
				this.zSpeed = 0;
				toZ = 0;
			}
				
			if (Math.abs(this.xSpeed) > 0.01 || Math.abs(this.ySpeed) > 0.01 || Math.abs(this.zSpeed) > 0.01) {
				this.Move(this.xSpeed, this.ySpeed, this.zSpeed, false, false);
			} else {
				touchFinish = false;
				this.zSpeed = 0;
				this.ySpeed = 0;
				this.xSpeed = 0;
			}
		}
	}

	this.cameraController.prototype.OutOfBounds = function(o) {
		this.withinConstraints = !o;
		if (o) this.emit('inbounds');
		else this.emit('outofbounds');
	}

	this.cameraController.prototype.Update = function() {
		var vFOV = this.camera.fov * Math.PI / 180;
		this.camera.height = 2 * Math.tan( vFOV / 2 ) * this.camera.position.z, this.height = this.camera.height;
		this.camera.width = this.camera.height * (this.camera.sceneWidth/this.camera.sceneHeight), this.width = this.camera.width;
		this.camera.extents = {
			X1: this.camera.position.x - this.camera.width/2,
			Y1: this.camera.position.y - this.camera.height/2,
			X2: this.camera.position.x + this.camera.width/2,
			Y2: this.camera.position.y + this.camera.height/2
		};
		this.extents = this.camera.extents;
		this.position = this.camera.position;
		this.rotation = this.camera.rotation;
	}
	
	this.cameraController.prototype.HitTestX = function(X) {
		var r = X >= this.constraints.X1 && X <= this.constraints.X2; 
		if (!r && this.withinConstraints) this.OutOfBounds(true);
		else if (r && !this.withinConstraints) this.OutOfBounds(false);
		return r;
	};
	this.cameraController.prototype.HitTestY = function(Y) {
		var r = Y >= this.constraints.Y1 && Y <= this.constraints.Y2; 
		if (!r && this.withinConstraints) this.OutOfBounds(true);
		else if (r && !this.withinConstraints) this.OutOfBounds(false);
		return r;
	};
	this.cameraController.prototype.HitTestZ = function(Z) {
		var r = Z >= this.constraints.Z1 && Z <= this.constraints.Z2; 
		if (!r && this.withinConstraints) this.OutOfBounds(true);
		else if (r && !this.withinConstraints) this.OutOfBounds(false);
		return r;
	};
	this.cameraController.prototype.HitTestR = function(R) {return R >= this.constraints.R1 && R <= this.constraints.R2; };

	this.cameraController.prototype.on = function(e, cb, context) {
		this.subscribers[e] = this.subscribers[e] || [];
        this.subscribers[e].push({
            callback: cb,
            context: context
        });
	}

	this.cameraController.prototype.off = function(e, cb, context) {
		var i, subs, sub;
        if ((subs = this.subscribers[e])) {
            i = subs.length - 1;
            while (i >= 0) {
                sub = subs[e][i];
                if (sub.callback === cb && (!context || sub.context === context)) {
                    subs[e].splice(i, 1);
                    break;
                }
                i--;
            }
        }
	}

	this.cameraController.prototype.emit = function(e) {
		var subs, i = 0,
            args = Array.prototype.slice.call(arguments, 1);
        if ((subs = this.subscribers[e])) {
            while (i < subs.length) {
                sub = subs[i];
                sub.callback.apply(sub.context || this, args);
                i++;
            }
        }
	}
	//End Camera Controller 
	
	//CityController - Maintains cities
	this.cityController = function(d,c) {
		this.cities = [];
		this.city = undefined;
		this.defaultCity = undefined;
		this.curCircleModifier = defaultCityCircleCountModifier;
		this.curCircleTotal = defaultCityCircleCount;
		this.curCircleCount = 0;
		this.numCircles = 1;
		this.dataController = d;
		this.camera = c;
	};

	this.cityController.prototype.SpawnCity = function(tag, rawData, type, startX, startY) {
		if (typeof type === 'undefined') type = 0;
		if (tag == homeKeyword && !isMobile) {
			var c = this.PlaceCity(surroundingTags, rawData, type, startX, startY);
		} else {
			var c = this.PlaceCity(tag, rawData, type, startX, startY);
		}
		return c;
	};

	this.cityController.prototype.PlaceCity = function(tags, rawData, type, startX, startY) {
		var home = tags === homeKeyword || typeof tags === 'object';
		var angleDelta = 2 * Math.PI / this.curCircleTotal;

		if (home) {
			startX = 0;
			startY = 0;
		} else {
			if (!startX || !startY) {
				var city = this.defaultCity;
				var maxY = Math.max(Math.abs(city.extents.Y1),Math.abs(city.extents.Y2));
				var maxX = Math.max(Math.abs(city.extents.X1),Math.abs(city.extents.X2));
				var radius = this.numCircles == 1 ? Math.max(maxX,maxY) * mainCityRadius : Math.max(maxX,maxY) * mainCityRadius + Math.max(maxX,maxY) * this.numCircles * outerCityRadius;
				var originX = city.midpoint.X + city.width/4;
				var originY = city.midpoint.Y + city.height/4;
				var angle = angleDelta * this.curCircleCount;
				radius = randRange(radius-radius*0.2,radius+radius*0.6);
				var pos = getCoords(originX,originY,angle,radius);
				var randX = randRange(pos.X-pos.X*0.1,pos.X+pos.X*0.1);
				var randY = randRange(pos.Y-pos.Y*0.1,pos.Y+pos.Y*0.1);
				startX = randX;
				startY = randY;
			}
		}
		
		var tag = home ? homeKeyword : tags;
		var c = new self.city(dataController, rawData, startX, startY, type, tag);
		this.cities.push(c);
		c.index = this.cities.length;
		if (c.tag == homeKeyword) this.defaultCity = c;

		if (home && !isMobile) {
			angleDelta = 2 * Math.PI / tags.length;
			for (var tag in tags) {
				var data = dataController.GetAllWithTag(tags[tag]);
				this.SpawnCity(tags[tag], data, 0);
			}
		}
		this.curCircleCount++;

		if (this.curCircleCount >= this.curCircleTotal) {
			this.numCircles++;
			this.curCircleCount = 0;
			if (this.numCircles > 1) this.curCircleTotal += this.curCircleModifier;
		}

		return c;

		function getCoords(originX,originY,deg,radius) {
			return { 
				X: originX + (Math.cos(deg) * radius), 
				Y: originY + (Math.sin(deg) * radius)
			};
		}

		function randRange(min,max) {
		    return Math.floor(Math.random()*(max-min+1)+min);
		}
	};

	this.cityController.prototype.SetCity = function(city) {
		if (typeof city !== 'undefined') {
			if (city.index && city.index <= this.cities.length) {

				this.city = city;
				return 1;
			}
		}
		console.log('Error (cityController.SetCity): Tried to set a city with an out of range index');
		return 0;
	};

	this.cityController.prototype.CityIsSpawned = function(tag) {
		return this.GetCityByTag(tag) !== 0;
	};

	this.cityController.prototype.CityIsInView = function(tag,padding) {
		if (this.camera.position.z == 0 || !tag) return false;

		var paddingX, paddingY;
		if (typeof padding == undefined) padding = 0;
		
		if (padding) {
			paddingX = (padding/100) * this.camera.width;
			paddingY = (padding/100) * this.camera.height;
		} else {
			paddingX = 0;
			paddingY = 0;
		}

		var city = this.GetCityByTag(tag);
		if (city) {
			if (this.camera.position.x > city.extents.X2+paddingX || this.camera.position.y > city.extents.Y2+ paddingY || this.camera.position.x < city.extents.X1-paddingX || this.camera.position.y < city.extents.Y1-paddingY) {	
				return false;
			}
		} else {
			return false;
		}
		return true;
	}
	
	this.cityController.prototype.SetCityByIndex = function(index) {
		console.log(index);
		if (index <= this.cities.length) this.city = cities[index];
		else this.city = cities.length;
	};
	
	this.cityController.prototype.SetCityByTag = function(tag) {
		console.log(tag);
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
	this.city = function(dC, rawData, sX, sY, type, tag) {
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
		this.layoutData;
		this.tag = tag;
		this.buildings = [];
		this.buildingData = type ? rawData : rawData.slice();
		this.extents = {X1:undefined,Y1:undefined,X2:undefined,Y2:undefined,Z1:undefined,Z2:undefined};
		this.origin = {X:sX,Y:sY};
		this.width = 0;
		this.height = 0;
		this.midpoint = {X:0,Y:0};
		this.squareSize = Math.ceil(Math.sqrt(this.buildingData.length));
		this.buildingsPerRow = this.squareSize;
		this.buildingsPerColumn = this.squareSize;
		this.dataRef = dC;
		this.cityCircle = null;
		this.cityZoomCircle = null;
		this.spotLight = new THREE.SpotLight( 0xffffff );
		if (!type) this.init3DExplicitSubCity();
		else this.init3DExplicit();
	};
	
	this.city.prototype.CircleCity = function(subcity) {
		var cityPadding, circleThickness;
		if (subcity) {
			cityPadding = subCityCirclePadding;
			circleThickness = subCityCircleThickness;
		} else { 
			cityPadding = cityCirclePadding;
			circleThickness = cityCircleThickness;
		}
		var innerRadius = (this.width > this.height) ? this.width + cityPadding : this.height + cityPadding;
		
		var circleMaterial = new THREE.MeshLambertMaterial( {color: 0x363636, side: THREE.DoubleSide} );
		var circleGeometry = new THREE.CircleGeometry( innerRadius, 144 );				
		this.cityZoomCircle = new THREE.Mesh( circleGeometry, circleMaterial );
		scene.add( this.cityZoomCircle );
		this.cityZoomCircle.receiveShadow = true;
		this.cityZoomCircle.tag = this.tag;
		this.cityZoomCircle.position.x = this.midpoint.X;
		this.cityZoomCircle.position.y = this.midpoint.Y;
		this.cityZoomCircle.position.z = groundZ + 0.1;
		
		var cgeometry = new THREE.RingGeometry( innerRadius, innerRadius + circleThickness, 144 );
		var cmaterial = new THREE.MeshBasicMaterial( { color: 0xe12726, side: THREE.DoubleSide } );
		this.cityCircle = new THREE.Mesh( cgeometry, cmaterial );
		scene.add( this.cityCircle );
		this.cityCircle.position.x = this.midpoint.X;
		this.cityCircle.position.y = this.midpoint.Y;
		this.cityCircle.position.z = groundZ + 0.2;
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
				if (y === Math.ceil(this.buildingData.length / 2) && !isIE) thisbox.cube.add(citySound);
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
		this.extents.Z2 = this.extents.Z1 + camZ2Init;
		this.CircleCity();
		
	};
	
	this.city.prototype.init3DExplicitSubCity = function() {
		var uselayout = this.tag == 'news' ? newslayout : sublayout;
		
		var cityLayout = {};
		cityLayout.tiles = uselayout.tiles.slice();
		cityLayout.types = uselayout.types.slice();
		this.layoutData = dataController.NormalizeLayoutData(cityLayout);
		var scLayoutData = [];
		
		for (var i in this.buildingData) {
			var temp = this.layoutData.tiles[i];
			temp.id = this.buildingData[i].id;
			scLayoutData.push(temp);
		}
		
		if (!isIE) {
			var suburbSound = new THREE.Audio( listener, true );
			suburbSound.load( 'sounds/smallcity.mp3' );
			suburbSound.setRefDistance(audioRefDistance);
			suburbSound.setVolume(audioVolume - 0.15);
			suburbSound.autoplay = true;
			suburbSound.setLoop(1);
		}
		
		this.layoutData.tiles = scLayoutData.slice();
		
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
				if (y === Math.floor(this.buildingData.length / 2) && !isIE) thisbox.cube.add(suburbSound);
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
		this.extents.Z2 = this.extents.Z1 + camZ2Init;
		this.CircleCity(true);
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
		this.extents.Z2 = this.extents.Z1 + camZ2Init;
		this.CircleCity(true);
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

	//Indicator - Shows the direction of a given set of coordinates, messenger
	this.indicator = function(c) {
		this.hidden = true;
		this.forceHide = false;
		this.destination = { X: 1, Y: 1 };
		this.location = { X: 1, Y: 1 };
		this.raycastLine = { X1: 0, X2: 0, Y1: 0, Y2: 0 };
		this.colliderLine = undefined;
		this.subscribers = {};
		this.angle = 0;
		this.camera = c;
		this.X = 0;
		this.Y = 0;
	}

	this.indicator.prototype.SetDestination = function(coords) {
		this.destination = coords;
		this.emit('setdestination');
	}

	this.indicator.prototype.Show = function(force) {
		if ((this.forceHide && force) || !this.forceHide) {
			this.hidden = false;
			this.forceHide = force || false;
			this.emit('show');
		}
	}

	this.indicator.prototype.Update = function() {
		this.location = {X: this.camera.position.x, Y: this.camera.position.y};
		var deltaX = this.location.X - this.destination.X;
		var deltaY = this.location.Y - this.destination.Y;
		this.angle = Math.abs((Math.atan2(deltaY, deltaX) * 180 / Math.PI) - 180);
		this.raycastLine = {X1: this.location.X, X2: this.destination.X, Y1: this.location.Y, Y2: this.destination.Y };
		this.emit('update');
	}

	this.indicator.prototype.GetPosition = function(box) {
		var top = { X1: box.left, X2: box.left+box.width, Y1: box.top, Y2: box.top };
		var right = { X1: box.left+box.width, X2: box.left+box.width, Y1: box.top, Y2: box.top+box.height };
		var bottom = { X1: box.left, X2: box.left+box.width, Y1: box.top+box.height, Y2: box.top+box.height };
		var left = { X1: box.left, X2: box.left, Y1: box.top, Y2: box.top+box.height };
		var rotation;

		this.raycastLine = {
			X1: box.width/2,
			Y1: box.height/2
		};
		var deltaX = this.location.X - this.destination.X;
		var deltaY = this.location.Y - this.destination.Y;
		this.raycastLine.X2 = deltaX * this.raycastLine.X1 * -1;
		this.raycastLine.Y2 = deltaY * this.raycastLine.Y1;

		var defaultCoords, coords;
		var intersectR = intersect(this.raycastLine,right);
		var intersectT = intersect(this.raycastLine,top);
		var intersectB = intersect(this.raycastLine,bottom);
		var intersectL = intersect(this.raycastLine,left);

		if (intersectR) {
			this.colliderLine = right;
			defaultCoords = {X: box.left, Y:box.top+box.height/2};
			coords = intersectR;
			rotation = 90;
		} else if (intersectT) {
			this.colliderLine = top;
			defaultCoords = {X: box.left+box.width/2, Y:box.top+box.height};
			coords = intersectT;
			rotation = 0;
		} else if (intersectB) {
			this.colliderLine = bottom;
			defaultCoords = {X: box.left+box.width, Y:box.top+box.height/2};
			coords = intersectB;
			rotation = 180;
		} else if (intersectL) {
			this.colliderLine = left;
			defaultCoords = {X: box.left+box.width/2, Y:box.top};
			coords = intersectL;
			rotation = 270;
		}

		if (coords == -1) coords = defaultCoords, coords.rotation = rotation;
		if (coords) {
			this.X = coords.X;
			this.Y = coords.Y;
			this.rotation = rotation;
			coords.rotation = rotation;
		}
		return coords;

		function intersect(line2, line1) {
			denominator = ((line2.Y2 - line2.Y1) * (line1.X2 - line1.X1)) - ((line2.X2 - line2.X1) * (line1.Y2 - line1.Y1));
			if (!denominator) return -1;
			var a = line1.Y1 - line2.Y1;
			var b = line1.X1 - line2.X1;
			numerator1 = ((line2.X2 - line2.X1) * a) - ((line2.Y2 - line2.Y1) * b);
		    numerator2 = ((line1.X2 - line1.X1) * a) - ((line1.Y2 - line1.Y1) * b);
		    a = numerator1 / denominator;
		    b = numerator2 / denominator;

		    if (a <= 0 || a >= 1 || b <= 0 || b >= 1) return false;

		    return { 
		    	X: line1.X1 + (a * (line1.X2 - line1.X1)),
		    	Y: line1.Y1 + (a * (line1.Y2 - line1.Y1))
		    };
		}
	}

	this.indicator.prototype.Hide = function(force) {
		this.hidden = true;
		this.forceHide = force;
		this.emit('hide');
	}

	this.indicator.prototype.on = function(e, cb, context) {
		this.subscribers[e] = this.subscribers[e] || [];
        this.subscribers[e].push({
            callback: cb,
            context: context
        });
	}

	this.indicator.prototype.off = function(e, cb, context) {
		var i, subs, sub;
        if ((subs = this.subscribers[e])) {
            i = subs.length - 1;
            while (i >= 0) {
                sub = subs[e][i];
                if (sub.callback === cb && (!context || sub.context === context)) {
                    subs[e].splice(i, 1);
                    break;
                }
                i--;
            }
        }
	}

	this.indicator.prototype.emit = function(e) {
		var subs, i = 0,
            args = Array.prototype.slice.call(arguments, 1);
        if ((subs = this.subscribers[e])) {
            while (i < subs.length) {
                sub = subs[i];
                sub.callback.apply(sub.context || this, args);
                i++;
            }
        }
	}
	//End Indicator
};