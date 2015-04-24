Object.size=function(t){var i=0,e;for(e in t)t.hasOwnProperty(e)&&i++;return i};var _objects=function(){var t=this;this.MultiplyArray=function(t,i){if(2>t)return i;for(var e=i.slice(),s=1;t>=s;s++)e=e.concat(i);return this.ShuffleArray(e)},this.ShuffleArray=function(t){for(var i=t.length,e,s;0!==i;)s=Math.floor(Math.random()*i),i-=1,e=t[i],t[i]=t[s],t[s]=e;return t},this.dataController=function(t){this.data={},this.rawData=[],this.materials={c:{},t:{}},this.textures={},this.textureNames=[],this.loadedTextures=0,this.subscribers={},this.loaded=!1,"undefined"!=typeof t&&this.SetData(t)},this.dataController.prototype.GetTexture=function(t){if(!(t.img in this.textures)){var i=this;this.textures[t.img]=new THREE.ImageUtils.loadTexture(t.img,void 0,function(){++i.loadedTextures>=Object.keys(i.textureNames).length&&(i.emit("loaded"),i.loaded=!0)},function(){i.loadedTextures++}),this.textures[t.img].wrapS=THREE.RepeatWrapping,this.textures[t.img].wrapT=THREE.RepeatWrapping,this.textures[t.img].anistropy=maxAnisotropy}var e=this.textures[t.img];return e},this.dataController.prototype.GetMaterial=function(t,i){var e=this.GetTexture(t);i in this.materials.c||(this.materials.c[i]=new THREE.MeshLambertMaterial({color:i})),t.img in this.materials.t||(this.materials.t[t.img]=new THREE.MeshLambertMaterial({map:e}));var s=this.materials.c[i],n=this.materials.t[t.img],o=[s,s,s,s,n,s];return o[4].minFilter=THREE.NearestFilter,o},this.dataController.prototype.SetData=function(t){for(var i=0;i<t.length;i++){var e=parseInt(t[i].id);this.data[e]=t[i],e in this.textureNames||this.textureNames.push(e)}this.rawData=t,this.fuse=new Fuse(this.rawData,{keys:["tags"]}),this.fuseId=new Fuse(this.rawData,{keys:["tags"],id:"tags"})},this.dataController.prototype.NormalizeLayoutData=function(t){var i=100,e=2e3,s=2e3;for(var n in t.types)t.types[n].w<i&&(i=t.types[n].w),t.types[n].h<i&&(i=t.types[n].h);for(var n in t.types)t.types[n].h=t.types[n].h/i,t.types[n].w=t.types[n].w/i;for(var n in t.tiles)t.tiles[n].x=t.tiles[n].x/i,t.tiles[n].y=t.tiles[n].y/i,t.tiles[n].x<e&&(e=t.tiles[n].x),t.tiles[n].y<s&&(s=t.tiles[n].y);for(var n in t.tiles)t.tiles[n].x-=e,t.tiles[n].y-=s;return t},this.dataController.prototype.GetBuildingsFromTiles=function(t){var i=[];for(var e in t.tiles)isNaN(t.tiles[e].id)?(console.log("error: a tile id in layout.js is NaN, a layer in the source illustrator file was not properly named"),i.push(this.data[15])):!t.tiles[e].id in this.data?(console.log("error: tile id does not exist"),i.push(this.data[15])):i.push(this.data[t.tiles[e].id]);return i},this.dataController.prototype.GetByID=function(t){return this.data[t]},this.dataController.prototype.GetBySlug=function(t){for(var i=Object.keys(this.data),e=0;e<i.length;e++)if(this.data[i[e]].slug==t)return this.data[i[e]]},this.dataController.prototype.GetByType=function(t){for(var i=[],e=Object.keys(this.data),s=0;s<e.length;s++)this.data[e[s]].overlay==t&&i.push(this.data[e[s]]);return i},this.dataController.prototype.GetAllWithTag=function(t){return this.fuse.search(t)},this.dataController.prototype.GetIdsWithTag=function(t){return this.fuseId.search(t)},this.dataController.prototype.on=function(t,i,e){this.subscribers[t]=this.subscribers[t]||[],this.subscribers[t].push({callback:i,context:e})},this.dataController.prototype.off=function(t,i){var e,s,n;if(s=this.subscribers[t])for(e=s.length-1;e>=0;)n=this.subscribers[t][e],n.context===i&&this.subscribers[t].splice(e,1),e--},this.dataController.prototype.emit=function(t){var i,e=0,s=Array.prototype.slice.call(arguments,1);if(i=this.subscribers[t])for(;e<i.length;)sub=i[e],sub.callback.apply(sub.context||this,s),e++},this.cameraController=function(t,i,e,s){this.scene=i,this.renderer=t,this.camera=e,this.spotlight=s,this.withinConstraints=!0,this.constraints={X1:0,Y1:0,Z1:0,X2:0,Y2:0,Z2:0,R1:0,R2:0},this.rotation=void 0,this.subscribers={},this.position=void 0,this.extents=void 0,this.width=void 0,this.height=void 0,this.constrain=!0,this.origin={X:0,Y:0},this.animating=!1,this.zoomed=!1,this.xSpeed=0,this.ySpeed=0,this.zSpeed=0,this.Update()},this.cameraController.prototype.CenterOnCity=function(t,i,e){if("undefined"==typeof i&&(i=!1),-1==t||!t)return console.log("Error (cameraController.CenterOnCity): tried to center on invalid city"),-1;var s={X1:t.extents.X1-camXExtents,Y1:t.extents.Y1-camYExtents,Z1:t.extents.Z1-camZ1Extents,X2:t.extents.X2+camXExtents,Y2:t.extents.Y2+camYExtents,Z2:t.extents.Z2+camZ2Extents,R1:camRotateMin,R2:camRotateMax},n=this;i?(this.SetConstraints(s),this.Move(t.midpoint.X,t.midpoint.Y),this.Zoom(t.extents.Z2-camZEnd,void 0,void 0,!0,!1,void 0),this.withinConstraints=!0,"function"==typeof e&&e()):t.tag!=homeKeyword||this.zoomed?this.Zoom(t.extents.Z2/3,void 0,camZAnimationTime/2,!1,!1,void 0,function(){n.SetConstraints(s),n.Pan(t.midpoint.X,t.midpoint.Y,void 0,void 0,camPanToCityAnimationTime,!0,!1,TWEEN.Easing.Cubic.InOut,function(){n.withinConstraints=!0,n.Zoom(t.extents.Z2-camZEnd,void 0,camZAnimationTime/2,!0,!1,void 0,function(){"function"==typeof e&&e()})})}):(this.camera.position.z=t.extents.Z2*camZStart,this.SetConstraints(s),this.Move(t.midpoint.X,t.midpoint.Y,this.camera.position.z,!0,!1),this.Zoom(t.extents.Z2-camZEnd,void 0,camZAnimationTime,!0,!1,void 0,function(){controlsinit||(controlsinit=!0,setupEventListeners()),n.withinConstraints=!0,"function"==typeof e&&e()})),this.SetOrigin(t.midpoint.X,t.midpoint.Y),spotLight.shadowCameraFar=1.5*t.extents.Z2},this.cameraController.prototype.AnimateBlur=function(t,i,e){"undefined"==typeof t&&(t=0),t>.003&&(t=.003),0>t&&(t=0);var s=vblurPass.uniforms.v.value,n=new TWEEN.Tween({value:s}).to({value:t},1e3*i).easing(TWEEN.Easing.Cubic.InOut).onUpdate(function(){vblurPass.uniforms.v.value=this.value,hblurPass.uniforms.h.value=this.value}).onComplete(function(){"undefined"!=typeof e&&e()}).start()},this.cameraController.prototype.SetConstraints=function(t){"undefined"!=typeof t.X1&&(this.constraints.X1=t.X1),"undefined"!=typeof t.Y1&&(this.constraints.Y1=t.Y1),"undefined"!=typeof t.Z1&&(this.constraints.Z1=t.Z1),"undefined"!=typeof t.R1&&(this.constraints.R1=t.R1),"undefined"!=typeof t.X2&&(this.constraints.X2=t.X2),"undefined"!=typeof t.Y2&&(this.constraints.Y2=t.Y2),"undefined"!=typeof t.Z2&&(this.constraints.Z2=t.Z2),"undefined"!=typeof t.R2&&(this.constraints.R2=t.R2)},this.cameraController.prototype.SetOrigin=function(t,i){"undefined"!=typeof t&&(this.origin.X=t),"undefined"!=typeof i&&(this.origin.Y=i)},this.cameraController.prototype.Pan=function(t,i,e,s,n,o,a,r,h){this.PanX(t,e,n,o,a,r,h),this.PanY(i,s,n,o,a,r),debug&&debugMovement&&console.log("Pan: X:"+t+",Y:"+i)},this.cameraController.prototype.PanX=function(t,i,e,s,n,o,a){var r=this;if("undefined"==typeof e&&(e=.01),"undefined"==typeof o&&(o=TWEEN.Easing.Linear.None),"undefined"==typeof n&&(n=!0),"undefined"==typeof s&&(s=!1),"undefined"==typeof i&&(i=this.camera.position.x),s||(t=i+t),(this.HitTestX(t)||!this.constrain)&&!this.animating||!n){n||(this.animating=!0);var h=new TWEEN.Tween({x:i}).to({x:t},1e3*e).easing(o).onUpdate(function(){r.camera.position.x=this.x,r.spotlight.position.x=this.x-r.spotlight.offset.x,r.spotlight.updateMatrixWorld(),r.spotlight.target.updateMatrixWorld()}).onComplete(function(){r.animating=!1,"undefined"!=typeof a&&a()}).start()}debug&&debugMovement&&console.log("PanX:"+t)},this.cameraController.prototype.PanY=function(t,i,e,s,n,o,a){var r=this;if("undefined"==typeof e&&(e=.01),"undefined"==typeof n&&(n=!0),"undefined"==typeof o&&(o=TWEEN.Easing.Linear.None),"undefined"==typeof s&&(s=!1),"undefined"==typeof i&&(i=this.camera.position.y),s||(t=i+t),(this.HitTestY(t)||!this.constrain)&&!this.animating||!n){n||(this.animating=!0);var h=new TWEEN.Tween({y:i}).to({y:t},1e3*e).easing(o).onUpdate(function(){r.camera.position.y=this.y,r.spotlight.position.x=this.y+r.spotlight.offset.y,r.spotlight.updateMatrixWorld(),r.spotlight.target.updateMatrixWorld()}).onComplete(function(){r.animating=!1,"undefined"!=typeof a&&a()}).start()}debug&&debugMovement&&console.log("PanY:"+t)},this.cameraController.prototype.Zoom=function(t,i,e,s,n,o,a){var r=this;if("undefined"==typeof n&&(n=!0),"undefined"==typeof o&&(o=TWEEN.Easing.Cubic.InOut),"undefined"==typeof e&&(e=.01),"undefined"==typeof s&&(s=!1),"undefined"==typeof i&&(i=this.camera.position.z),s||(t=i+t),debug&&debugMovement&&console.log("Zoom: "+t),this.HitTestZ(t)&&!this.animating||!n){n||(this.animating=!0);var h=new TWEEN.Tween({z:i}).to({z:t},1e3*e).easing(o).onUpdate(function(){r.camera.position.z=this.z}).onComplete(function(){r.animating=!1,r.zoomed=i>t,"undefined"!=typeof a&&a()}).start()}},this.cameraController.prototype.Move=function(t,i,e,s,n){"undefined"==typeof n&&(n=!0),"undefined"==typeof s&&(s=!0),s||(t=this.camera.position.x+t,i=this.camera.position.y+i,e=this.camera.position.z+e),"undefined"==typeof t||isNaN(t)||(!this.HitTestX(t)&&this.constrain||this.animating)&&n&&!s||(this.camera.position.x=t,this.spotlight.position.x=t-this.spotlight.offset.x,this.spotlight.updateMatrixWorld(),this.spotlight.target.updateMatrixWorld()),"undefined"==typeof i||isNaN(i)||(!this.HitTestX(i)&&this.constrain||this.animating)&&n&&!s||(this.camera.position.y=i,this.spotlight.position.y=i+this.spotlight.offset.y,this.spotlight.updateMatrixWorld(),this.spotlight.target.updateMatrixWorld()),"undefined"==typeof e||isNaN(e)||(!this.HitTestX(e)&&this.constrain||this.animating)&&n&&!s||(this.camera.position.z=e),debug&&debugMovement&&console.log("Move: X:"+t+",Y:"+i+",Z:"+e)},this.cameraController.prototype.Rotate=function(t,i,e,s,n,o){var a=this;if("undefined"==typeof s&&(s=!0),s||(t=this.camera.rotation.x+t,i=this.camera.rotation.y+i,e=this.camera.rotation.z+e),"undefined"!=typeof t&&!isNaN(t)&&this.HitTestR(t)&&!this.animating)if(n){this.animating=!0;var r=new TWEEN.Tween({x:this.camera.rotation.x}).to({x:t},500).easing(TWEEN.Easing.Cubic.InOut).onUpdate(function(){a.camera.rotation.x=this.x}).onComplete(function(){a.animating=!1,"undefined"!=typeof o&&o()}).start()}else this.camera.rotation.x=t;"undefined"==typeof i||isNaN(i)||this.HitTestR(i)&&!this.animating&&(this.camera.rotation.y=i),"undefined"==typeof e||isNaN(e)||this.HitTestR(e)&&!this.animating&&(this.camera.rotation.z=e),debug&&debugMovement&&console.log("Rotate: X:"+t+",Y:"+i+",Z:"+e)},this.cameraController.prototype.AfterRelease=function(){if(!mTouchDown&&!this.animating&&!pinched){debug&&debugMovement&&console.log("X Speed = "+this.xSpeed+", Y Speed = "+this.ySpeed);var t=1.2,i=this.camera.position.x+this.xSpeed/t;this.xSpeed=this.HitTestX(i)?this.xSpeed/t:0;var e=this.camera.position.y+this.ySpeed/t;this.ySpeed=this.HitTestY(e)?this.ySpeed/t:0;var s=this.camera.position.z+this.zSpeed/t;this.zSpeed=this.HitTestZ(s)?this.zSpeed/t:0,Math.abs(this.xSpeed)>.01||Math.abs(this.ySpeed)>.01||Math.abs(this.zSpeed)>.01?this.Move(this.xSpeed,this.ySpeed,this.zSpeed,!1):(touchFinish=!1,this.zSpeed=0,this.ySpeed=0,this.xSpeed=0)}},this.cameraController.prototype.OutOfBounds=function(t){this.withinConstraints=!t,this.emit(t?"inbounds":"outofbounds")},this.cameraController.prototype.Update=function(){var t=this.camera.fov*Math.PI/180;this.camera.height=2*Math.tan(t/2)*this.camera.position.z,this.height=this.camera.height,this.camera.width=this.camera.height*(this.camera.sceneWidth/this.camera.sceneHeight),this.width=this.camera.width,this.camera.extents={X1:this.camera.position.x-this.camera.width/2,Y1:this.camera.position.y-this.camera.height/2,X2:this.camera.position.x+this.camera.width/2,Y2:this.camera.position.y+this.camera.height/2},this.extents=this.camera.extents,this.position=this.camera.position,this.rotation=this.camera.rotation},this.cameraController.prototype.HitTestX=function(t){var i=t>=this.constraints.X1&&t<=this.constraints.X2;return!i&&this.withinConstraints?this.OutOfBounds(!0):i&&!this.withinConstraints&&this.OutOfBounds(!1),i},this.cameraController.prototype.HitTestY=function(t){var i=t>=this.constraints.Y1&&t<=this.constraints.Y2;return!i&&this.withinConstraints?this.OutOfBounds(!0):i&&!this.withinConstraints&&this.OutOfBounds(!1),i},this.cameraController.prototype.HitTestZ=function(t){var i=t>=this.constraints.Z1&&t<=this.constraints.Z2;return!i&&this.withinConstraints?this.OutOfBounds(!0):i&&!this.withinConstraints&&this.OutOfBounds(!1),i},this.cameraController.prototype.HitTestR=function(t){return t>=this.constraints.R1&&t<=this.constraints.R2},this.cameraController.prototype.on=function(t,i,e){this.subscribers[t]=this.subscribers[t]||[],this.subscribers[t].push({callback:i,context:e})},this.cameraController.prototype.off=function(t,i,e){var s,n,o;if(n=this.subscribers[t])for(s=n.length-1;s>=0;){if(o=n[t][s],o.callback===i&&(!e||o.context===e)){n[t].splice(s,1);break}s--}},this.cameraController.prototype.emit=function(t){var i,e=0,s=Array.prototype.slice.call(arguments,1);if(i=this.subscribers[t])for(;e<i.length;)sub=i[e],sub.callback.apply(sub.context||this,s),e++},this.cityController=function(t,i){this.cities=[],this.city=void 0,this.defaultCity=void 0,this.curCircleModifier=defaultCityCircleCountModifier,this.curCircleTotal=defaultCityCircleCount,this.curCircleCount=0,this.numCircles=1,this.dataController=t,this.camera=i},this.cityController.prototype.SpawnCity=function(t,i,e,s,n){if("undefined"==typeof e&&(e=0),t!=homeKeyword||isMobile)var o=this.PlaceCity(t,i,e,s,n);else var o=this.PlaceCity(surroundingTags,i,e,s,n);return o},this.cityController.prototype.PlaceCity=function(i,e,s,n,o){function a(t,i,e,s){return{X:t+Math.cos(e)*s,Y:i+Math.sin(e)*s}}function r(t,i){return Math.floor(Math.random()*(i-t+1)+t)}var h=i===homeKeyword||"object"==typeof i,c=2*Math.PI/this.curCircleTotal;if(h)n=0,o=0;else if(!n||!o){var d=this.defaultCity,u=Math.max(Math.abs(d.extents.Y1),Math.abs(d.extents.Y2)),l=Math.max(Math.abs(d.extents.X1),Math.abs(d.extents.X2)),p=1==this.numCircles?Math.max(l,u)*mainCityRadius:Math.max(l,u)*mainCityRadius+Math.max(l,u)*this.numCircles*outerCityRadius,f=d.midpoint.X+d.width/4,y=d.midpoint.Y+d.height/4,m=c*this.curCircleCount;p=r(p-.2*p,p+.6*p);var g=a(f,y,m,p),x=r(g.X-.1*g.X,g.X+.1*g.X),b=r(g.Y-.1*g.Y,g.Y+.1*g.Y);n=x,o=b}var C=new t.city(buildingsPerRow,buildingsPerColumn,dataController,e,n,o,s);if(C.tag=h?homeKeyword:i,this.cities.push(C),C.index=this.cities.length,C.tag==homeKeyword&&(this.defaultCity=C),h&&!isMobile){c=2*Math.PI/i.length;for(var v in i){var X=dataController.GetAllWithTag(i[v]);this.SpawnCity(i[v],X,0)}}return this.curCircleCount++,this.curCircleCount>=this.curCircleTotal&&(this.numCircles++,this.curCircleCount=0,this.numCircles>1&&(this.curCircleTotal+=this.curCircleModifier)),C},this.cityController.prototype.SetCity=function(t){return"undefined"!=typeof t&&t.index&&t.index<=this.cities.length?(this.city=t,1):(console.log("Error (cityController.SetCity): Tried to set a city with an out of range index"),0)},this.cityController.prototype.CityIsSpawned=function(t){return 0!==this.GetCityByTag(t)},this.cityController.prototype.CityIsInView=function(t,i){if(0==this.camera.position.z||!t)return!1;var e,s;void 0==typeof i&&(i=0),i?(e=i/100*this.camera.width,s=i/100*this.camera.height):(e=0,s=0);var n=this.GetCityByTag(t);return n?this.camera.position.x>n.extents.X2+e||this.camera.position.y>n.extents.Y2+s||this.camera.position.x<n.extents.X1-e||this.camera.position.y<n.extents.Y1-s?!1:!0:!1},this.cityController.prototype.SetCityByIndex=function(t){console.log(t),this.city=t<=this.cities.length?cities[t]:cities.length},this.cityController.prototype.SetCityByTag=function(t){console.log(t);var i=this.GetCityByTag(t);return i?(this.city=i,1):0},this.cityController.prototype.GetCityByID=function(t){return t<this.cities.length?this.cities[t]:city},this.cityController.prototype.GetCityByTag=function(t){if("string"==typeof t)for(var i in this.cities)if("undefined"!=typeof this.cities[i].tag&&this.cities[i].tag==t)return this.cities[i];return 0},this.city=function(t,i,e,s,n,o,a){"undefined"==typeof a&&(a=0),this.logMatrix=function(t){if(debug)for(var i in t)for(var e in i)console.log(t[i][e])},this.index=void 0,this.tag="default",this.buildings=[],this.buildingData=a?s:s.slice(),this.extents={X1:void 0,Y1:void 0,X2:void 0,Y2:void 0,Z1:void 0,Z2:void 0},this.origin={X:n,Y:o},this.width=0,this.height=0,this.midpoint={X:0,Y:0},this.buildingsPerRow=t,this.buildingsPerColumn=i,this.dataRef=e,this.cityCircle=null,this.spotLight=new THREE.SpotLight(16777215),a?this.init3DExplicit():this.init3DRandomized()},this.city.prototype.CircleCity=function(t){var i,e;t?(i=subCityCirclePadding,e=subCityCircleThickness):(i=cityCirclePadding,e=cityCircleThickness);var s=this.width>this.height?this.width+i:this.height+i,n=new THREE.RingGeometry(s,s+e,144),o=new THREE.MeshBasicMaterial({color:14755622,side:THREE.DoubleSide});this.cityCircle=new THREE.Mesh(n,o),scene.add(this.cityCircle),this.cityCircle.position.x=this.midpoint.X,this.cityCircle.position.y=this.midpoint.Y,this.cityCircle.position.z=groundZ+.2},this.city.prototype.init3DExplicit=function(){camMinHeight=0,this.layoutData=dataController.NormalizeLayoutData(this.buildingData),this.buildingData=dataController.GetBuildingsFromTiles(this.layoutData);for(var i=0;i<=this.buildingData.length-1;i++){var e={},s=new t.building(this.buildingData[i]);if("undefined"!=typeof s){var n=this.layoutData.tiles[i].type,o=this.layoutData.types[n].h,a=this.layoutData.types[n].w,r=Math.random()*buildingHeightVariance+1*boxdepth*10;r/2+1>camMinHeight&&(camMinHeight=Math.ceil(r/2+1)),e.geometry=new THREE.BoxGeometry(a,o,r);var h=parseInt(s.hex_color,16);e.material=this.dataRef.GetMaterial(s,h),e.cube=new THREE.Mesh(e.geometry,new THREE.MeshFaceMaterial(e.material)),e.cube.castShadow=!0,e.cube.receiveShadow=!0,e.cube.name=s.id,scene.add(e.cube),e.cube.position.x=this.origin.X+this.layoutData.tiles[i].x+this.layoutData.types[n].w/2,e.cube.position.y=this.origin.Y+this.layoutData.tiles[i].y+this.layoutData.types[n].h/2,(e.cube.position.x+1.4*a<this.extents.X1||"number"!=typeof this.extents.X1)&&(this.extents.X1=e.cube.position.x+1.4*a),(e.cube.position.x-1.4*a>this.extents.X2||"number"!=typeof this.extents.X2)&&(this.extents.X2=e.cube.position.x-1.4*a),(e.cube.position.y+o/4<this.extents.Y1||"number"!=typeof this.extents.Y1)&&(this.extents.Y1=e.cube.position.y+o/4),(e.cube.position.y-o/4>this.extents.Y2||"number"!=typeof this.extents.Y2)&&(this.extents.Y2=e.cube.position.y-o/4),(e.cube.position.z-r/2<this.extents.Z1||"number"!=typeof this.extents.Z1)&&(this.extents.Z1=e.cube.position.z+r/3),s.SetModel(e.cube),this.buildings[parseInt(s.id)]=s,objects.push(e.cube)}else console.log("warning: tried to spawn invalid building)")}this.midpoint.X=(this.extents.X2+this.extents.X1)/2,this.midpoint.Y=(this.extents.Y2+this.extents.Y1)/2,this.width=Math.abs(this.extents.X1-this.extents.X2),this.height=Math.abs(this.extents.Y1-this.extents.Y2),this.extents.Z2=this.extents.Z1+camZ2Init,this.CircleCity()},this.city.prototype.init3DRandomized=function(){var i=gridSizex-boxwidth,e=gridSizey-boxheight,s=jitterX,n=jitterY;this.drawMatrix=math.zeros(this.buildingsPerRow,this.buildingsPerColumn),this.dataMatrix=math.zeros(1,this.buildingData.length),camMinHeight=0;for(var o=this.buildingData.length,a=!1,r=0,h=1;h<=this.buildingsPerColumn;h++){for(var c=this.buildingsPerRow;c>=1;c--){var d={},u=new t.building(this.buildingData[r]);if("undefined"==typeof u){a=!0;break}for(var l=!1,p=!1,f=0;f<u.xsize;f++){for(var y=0;y<u.ysize&&(h+y-1<this.buildingsPerColumn&&this.buildingsPerRow-c+f<this.buildingsPerRow?this.drawMatrix.subset(math.index(h+y-1,this.buildingsPerRow-c+f))>0&&(debug&&debugGrid&&console.log("found tile extending into occupied index"),p=!0,l=!0):l=!0,!l);y++);if(l)break}if(!p){for(var f=0;f<u.xsize;f++)for(var y=0;y<u.ysize;y++)h+y-1<this.buildingsPerColumn&&this.buildingsPerRow-c+f<this.buildingsPerRow&&this.drawMatrix.subset(math.index(h+y-1,this.buildingsPerRow-c+f),Math.max(u.xsize,u.ysize));this.buildingData.splice(r,1),s*=-1,n*=-1;var m=e*(u.ysize-1)+boxheight*u.ysize,g=i*(u.xsize-1)+boxwidth*u.xsize,x=Math.random()*buildingHeightVariance+1*boxdepth*10;x/2+1>camMinHeight&&(camMinHeight=Math.ceil(x/2+1)),d.geometry=new THREE.BoxGeometry(g,m,x);var b=parseInt(u.hex_color,16);if(d.material=this.dataRef.GetMaterial(u,b),d.cube=new THREE.Mesh(d.geometry,new THREE.MeshFaceMaterial(d.material)),d.cube.castShadow=!0,d.cube.receiveShadow=!0,d.cube.name=u.id,scene.add(d.cube),d.cube.position.x=this.origin.X+(-c*gridSizex- -(u.xsize-1)*gridSizex/2+s),d.cube.position.y=this.origin.Y+(-h*gridSizey-(u.ysize-1)*gridSizey/2+n),(d.cube.position.x+1.4*g<this.extents.X1||"number"!=typeof this.extents.X1)&&(this.extents.X1=d.cube.position.x+1.4*g),(d.cube.position.x-1.4*g>this.extents.X2||"number"!=typeof this.extents.X2)&&(this.extents.X2=d.cube.position.x-1.4*g),(d.cube.position.y+m/4<this.extents.Y1||"number"!=typeof this.extents.Y1)&&(this.extents.Y1=d.cube.position.y+m/4),(d.cube.position.y-m/4>this.extents.Y2||"number"!=typeof this.extents.Y2)&&(this.extents.Y2=d.cube.position.y-m/4),(d.cube.position.z-x/2<this.extents.Z1||"number"!=typeof this.extents.Z1)&&(this.extents.Z1=d.cube.position.z+x/3),u.SetModel(d.cube),this.buildings[parseInt(u.id)]=u,objects.push(d.cube),debug&&debugGrid&&this.logMatrix(this.drawMatrix),debug&&debugGrid&&this.logMatrix(this.dataMatrix),a)break}}if(a)break}this.midpoint.X=(this.extents.X2+this.extents.X1)/2,this.midpoint.Y=(this.extents.Y2+this.extents.Y1)/2,this.width=Math.abs(this.extents.X1-this.extents.X2),this.height=Math.abs(this.extents.Y1-this.extents.Y2),this.extents.Z2=this.extents.Z1+camZ2Init,this.CircleCity(!0)},this.building=function(t){"undefined"!=typeof t&&(this.xsize="undefined"==typeof t.xsize?void 0:t.xsize,this.ysize="undefined"==typeof t.ysize?void 0:t.ysize,this.id="undefined"==typeof t.id?void 0:t.id,this.title="undefined"==typeof t.title?void 0:t.title,this.description="undefined"==typeof t.description?void 0:t.description,this.tags="undefined"==typeof t.tags?void 0:t.tags,this.img="undefined"==typeof t.img?void 0:t.img,this.hex_color="undefined"==typeof t.hex_color?void 0:t.hex_color),this.model=void 0},this.building.prototype.SetModel=function(t){this.model=t},this.indicator=function(t){this.hidden=!0,this.forceHide=!1,this.destination={X:1,Y:1},this.location={X:1,Y:1},this.raycastLine={X1:0,X2:0,Y1:0,Y2:0},this.colliderLine=void 0,this.subscribers={},this.angle=0,this.camera=t,this.X=0,this.Y=0},this.indicator.prototype.SetDestination=function(t){this.destination=t,this.emit("setdestination")},this.indicator.prototype.Show=function(t){(this.forceHide&&t||!this.forceHide)&&(this.hidden=!1,this.forceHide=t||!1,this.emit("show"))},this.indicator.prototype.Update=function(){this.location={X:this.camera.position.x,Y:this.camera.position.y};var t=this.location.X-this.destination.X,i=this.location.Y-this.destination.Y;this.angle=Math.abs(180*Math.atan2(i,t)/Math.PI-180),this.raycastLine={X1:this.location.X,X2:this.destination.X,Y1:this.location.Y,Y2:this.destination.Y},this.emit("update")},this.indicator.prototype.GetPosition=function(t){function i(t,i){if(denominator=(t.Y2-t.Y1)*(i.X2-i.X1)-(t.X2-t.X1)*(i.Y2-i.Y1),!denominator)return-1;var e=i.Y1-t.Y1,s=i.X1-t.X1;return numerator1=(t.X2-t.X1)*e-(t.Y2-t.Y1)*s,numerator2=(i.X2-i.X1)*e-(i.Y2-i.Y1)*s,e=numerator1/denominator,s=numerator2/denominator,0>=e||e>=1||0>=s||s>=1?!1:{X:i.X1+e*(i.X2-i.X1),Y:i.Y1+e*(i.Y2-i.Y1)}}var e={X1:t.left,X2:t.left+t.width,Y1:t.top,Y2:t.top},s={X1:t.left+t.width,X2:t.left+t.width,Y1:t.top,Y2:t.top+t.height},n={X1:t.left,X2:t.left+t.width,Y1:t.top+t.height,Y2:t.top+t.height},o={X1:t.left,X2:t.left,Y1:t.top,Y2:t.top+t.height},a;this.raycastLine={X1:t.width/2,Y1:t.height/2};var r=this.location.X-this.destination.X,h=this.location.Y-this.destination.Y;this.raycastLine.X2=r*this.raycastLine.X1*-1,this.raycastLine.Y2=h*this.raycastLine.Y1;var c,d,u=i(this.raycastLine,s),l=i(this.raycastLine,e),p=i(this.raycastLine,n),f=i(this.raycastLine,o);return u?(this.colliderLine=s,c={X:t.left,Y:t.top+t.height/2},d=u,a=90):l?(this.colliderLine=e,c={X:t.left+t.width/2,Y:t.top+t.height},d=l,a=0):p?(this.colliderLine=n,c={X:t.left+t.width,Y:t.top+t.height/2},d=p,a=180):f&&(this.colliderLine=o,c={X:t.left+t.width/2,Y:t.top},d=f,a=270),-1==d&&(d=c,d.rotation=a),d&&(this.X=d.X,this.Y=d.Y,this.rotation=a,d.rotation=a),d},this.indicator.prototype.Hide=function(t){this.hidden=!0,this.forceHide=t,this.emit("hide")},this.indicator.prototype.on=function(t,i,e){this.subscribers[t]=this.subscribers[t]||[],this.subscribers[t].push({callback:i,context:e})},this.indicator.prototype.off=function(t,i,e){var s,n,o;if(n=this.subscribers[t])for(s=n.length-1;s>=0;){if(o=n[t][s],o.callback===i&&(!e||o.context===e)){n[t].splice(s,1);break}s--}},this.indicator.prototype.emit=function(t){var i,e=0,s=Array.prototype.slice.call(arguments,1);if(i=this.subscribers[t])for(;e<i.length;)sub=i[e],sub.callback.apply(sub.context||this,s),e++}};