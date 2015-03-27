var _objects=function(){var t=this;this.MultiplyArray=function(t,i){if(2>t)return i;for(var e=i.slice(),n=1;t>=n;n++)e=e.concat(i);return this.ShuffleArray(e)},this.ShuffleArray=function(t){for(var i=t.length,e,n;0!==i;)n=Math.floor(Math.random()*i),i-=1,e=t[i],t[i]=t[n],t[n]=e;return t},this.dataController=function(t){this.data={},this.rawData=[],this.materials={c:{},t:{}},this.textures={},"undefined"!=typeof t&&this.SetData(t)},this.dataController.prototype.GetTexture=function(t){t.img in this.textures||(this.textures[t.img]=new THREE.ImageUtils.loadTexture(t.img),this.textures[t.img].wrapS=THREE.RepeatWrapping,this.textures[t.img].wrapT=THREE.RepeatWrapping);var i=this.textures[t.img];return i},this.dataController.prototype.GetMaterial=function(t,i){var e=this.GetTexture(t);i in this.materials.c||(this.materials.c[i]=new THREE.MeshLambertMaterial({color:i})),t.img in this.materials.t||(this.materials.t[t.img]=new THREE.MeshLambertMaterial({map:e}));var n=this.materials.c[i],s=this.materials.t[t.img],o=[n,n,n,n,s,n];return o[4].minFilter=THREE.NearestFilter,o},this.dataController.prototype.SetData=function(t){for(var i=0;i<t.length;i++)this.data[parseInt(t[i].id)]=t[i];this.rawData=t,this.fuse=new Fuse(this.rawData,{keys:["tags"]}),this.fuseId=new Fuse(this.rawData,{keys:["tags"],id:"tags"})},this.dataController.prototype.NormalizeLayoutData=function(t){var i=100,e=2e3,n=2e3;for(var s in t.types)t.types[s].w<i&&(i=t.types[s].w),t.types[s].h<i&&(i=t.types[s].h);for(var s in t.types)t.types[s].h=t.types[s].h/i,t.types[s].w=t.types[s].w/i;for(var s in t.tiles)t.tiles[s].x=t.tiles[s].x/i,t.tiles[s].y=t.tiles[s].y/i,t.tiles[s].x<e&&(e=t.tiles[s].x),t.tiles[s].y<n&&(n=t.tiles[s].y);for(var s in t.tiles)t.tiles[s].x-=e,t.tiles[s].y-=n;return t},this.dataController.prototype.GetBuildingsFromTiles=function(t){var i=[];for(var e in t.tiles)isNaN(t.tiles[e].id)?(console.log("error: a tile id in layout.js is NaN, a layer in the source illustrator file was not properly named"),i.push(this.data[15])):!t.tiles[e].id in this.data?(console.log("error: tile id does not exist"),i.push(this.data[15])):i.push(this.data[t.tiles[e].id]);return i},this.dataController.prototype.GetByID=function(t){return this.data[t]},this.dataController.prototype.GetBySlug=function(t){for(var i=Object.keys(this.data),e=0;e<i.length;e++)if(this.data[i[e]].slug==t)return this.data[i[e]]},this.dataController.prototype.GetByType=function(t){for(var i=[],e=Object.keys(this.data),n=0;n<e.length;n++)this.data[e[n]].overlay==t&&i.push(this.data[e[n]]);return i},this.dataController.prototype.GetAllWithTag=function(t){return this.fuse.search(t)},this.dataController.prototype.GetIdsWithTag=function(t){return this.fuseId.search(t)},this.cameraController=function(t,i,e){this.scene=i,this.renderer=t,this.camera=e,this.constraints={X1:0,Y1:0,Z1:0,X2:0,Y2:0,Z2:0,R1:0,R2:0},this.origin={X:0,Y:0},this.animating=!1,this.zoomed=!1},this.cameraController.prototype.CenterOnCity=function(t,i){if("undefined"==typeof i&&(i=!1),-1==t)return console.log("Error (cameraController.CenterOnCity): Tried to Center on an invalid city"),0;var e={X1:t.extents.X1-camXExtents,Y1:t.extents.Y1-camYExtents,Z1:t.extents.Z1-camZ1Extents,X2:t.extents.X2+camXExtents,Y2:t.extents.Y2+camYExtents,Z2:t.extents.Z2+camZ2Extents,R1:camRotateMin,R2:camRotateMax};if(i)this.SetConstraints(e),this.Move(t.midpoint.X,t.midpoint.Y),this.Zoom(t.extents.Z2-camZEnd,void 0,void 0,!0,!1,void 0);else if(t.tag!=homeKeyword||this.zoomed){var n=this;this.Zoom(t.extents.Z2/3,void 0,camZAnimationTime/2,!1,!1,void 0,function(){n.SetConstraints(e),n.Pan(t.midpoint.X,t.midpoint.Y,void 0,void 0,camPanToCityAnimationTime,!0,!1,TWEEN.Easing.Cubic.InOut,function(){n.Zoom(t.extents.Z2-camZEnd,void 0,camZAnimationTime/2,!0,!1)})})}else this.camera.position.z=t.extents.Z2*camZStart,this.SetConstraints(e),this.Move(t.midpoint.X,t.midpoint.Y,this.camera.position.z,!0,!1),this.Zoom(t.extents.Z2-camZEnd,void 0,camZAnimationTime,!0,!1,void 0,function(){controlsinit||(controlsinit=!0,setupEventListeners())});this.SetOrigin(t.midpoint.X,t.midpoint.Y)},this.cameraController.prototype.AnimateBlur=function(t,i,e){"undefined"==typeof t&&(t=0),t>.003&&(t=.003),0>t&&(t=0);var n=vblurPass.uniforms.v.value,s=new TWEEN.Tween({value:n}).to({value:t},1e3*i).easing(TWEEN.Easing.Cubic.InOut).onUpdate(function(){vblurPass.uniforms.v.value=this.value,hblurPass.uniforms.h.value=this.value}).onComplete(function(){"undefined"!=typeof e&&e()}).start()},this.cameraController.prototype.SetConstraints=function(t){"undefined"!=typeof t.X1&&(this.constraints.X1=t.X1),"undefined"!=typeof t.Y1&&(this.constraints.Y1=t.Y1),"undefined"!=typeof t.Z1&&(this.constraints.Z1=t.Z1),"undefined"!=typeof t.R1&&(this.constraints.R1=t.R1),"undefined"!=typeof t.X2&&(this.constraints.X2=t.X2),"undefined"!=typeof t.Y2&&(this.constraints.Y2=t.Y2),"undefined"!=typeof t.Z2&&(this.constraints.Z2=t.Z2),"undefined"!=typeof t.R2&&(this.constraints.R2=t.R2)},this.cameraController.prototype.SetOrigin=function(t,i){"undefined"!=typeof t&&(this.origin.X=t),"undefined"!=typeof i&&(this.origin.Y=i)},this.cameraController.prototype.Pan=function(t,i,e,n,s,o,a,r,h){this.PanX(t,e,s,o,a,r,h),this.PanY(i,n,s,o,a,r),debug&&debugMovement&&console.log("Pan: X:"+t+",Y:"+i)},this.cameraController.prototype.PanX=function(t,i,e,n,s,o,a){var r=this;if("undefined"==typeof e&&(e=.01),"undefined"==typeof o&&(o=TWEEN.Easing.Linear.None),"undefined"==typeof s&&(s=!0),"undefined"==typeof n&&(n=!1),"undefined"==typeof i&&(i=this.camera.position.x),n||(t=i+t),this.HitTestX(t)&&!this.animating||!s){s||(this.animating=!0);var h=new TWEEN.Tween({x:i}).to({x:t},1e3*e).easing(o).onUpdate(function(){r.camera.position.x=this.x}).onComplete(function(){r.animating=!1,"undefined"!=typeof a&&a()}).start()}debug&&debugMovement&&console.log("PanX:"+t)},this.cameraController.prototype.PanY=function(t,i,e,n,s,o,a){var r=this;if("undefined"==typeof e&&(e=.01),"undefined"==typeof s&&(s=!0),"undefined"==typeof o&&(o=TWEEN.Easing.Linear.None),"undefined"==typeof n&&(n=!1),"undefined"==typeof i&&(i=this.camera.position.y),n||(t=i+t),this.HitTestY(t)&&!this.animating||!s){s||(this.animating=!0);var h=new TWEEN.Tween({y:i}).to({y:t},1e3*e).easing(o).onUpdate(function(){r.camera.position.y=this.y}).onComplete(function(){r.animating=!1,"undefined"!=typeof a&&a()}).start()}debug&&debugMovement&&console.log("PanY:"+t)},this.cameraController.prototype.Zoom=function(t,i,e,n,s,o,a){var r=this;if("undefined"==typeof s&&(s=!0),"undefined"==typeof o&&(o=TWEEN.Easing.Cubic.InOut),"undefined"==typeof e&&(e=.01),"undefined"==typeof n&&(n=!1),"undefined"==typeof i&&(i=this.camera.position.z),n||(t=i+t),debug&&debugMovement&&console.log("Zoom: "+t),this.HitTestZ(t)&&!this.animating||!s){s||(this.animating=!0);var h=new TWEEN.Tween({z:i}).to({z:t},1e3*e).easing(o).onUpdate(function(){r.camera.position.z=this.z}).onComplete(function(){r.animating=!1,r.zoomed=i>t,"undefined"!=typeof a&&a()}).start()}},this.cameraController.prototype.Move=function(t,i,e,n,s){"undefined"==typeof s&&(s=!0),"undefined"==typeof n&&(n=!0),n||(t=this.camera.position.x+t,i=this.camera.position.y+i,e=this.camera.position.z+e),"undefined"==typeof t||isNaN(t)||(this.HitTestX(t)&&!this.animating||!s||n)&&(this.camera.position.x=t),"undefined"==typeof i||isNaN(i)||(this.HitTestY(i)&&!this.animating||!s||n)&&(this.camera.position.y=i),"undefined"==typeof e||isNaN(e)||(this.HitTestZ(e)&&!this.animating||!s||n)&&(this.camera.position.z=e),debug&&debugMovement&&console.log("Move: X:"+t+",Y:"+i+",Z:"+e)},this.cameraController.prototype.Rotate=function(t,i,e,n,s,o){var a=this;if("undefined"==typeof n&&(n=!0),n||(t=this.camera.rotation.x+t,i=this.camera.rotation.y+i,e=this.camera.rotation.z+e),"undefined"!=typeof t&&!isNaN(t)&&this.HitTestR(t)&&!this.animating)if(s){this.animating=!0;var r=new TWEEN.Tween({x:this.camera.rotation.x}).to({x:t},500).easing(TWEEN.Easing.Cubic.InOut).onUpdate(function(){a.camera.rotation.x=this.x}).onComplete(function(){a.animating=!1,"undefined"!=typeof o&&o()}).start()}else this.camera.rotation.x=t;"undefined"==typeof i||isNaN(i)||this.HitTestR(i)&&!this.animating&&(this.camera.rotation.y=i),"undefined"==typeof e||isNaN(e)||this.HitTestR(e)&&!this.animating&&(this.camera.rotation.z=e),debug&&debugMovement&&console.log("Rotate: X:"+t+",Y:"+i+",Z:"+e)},this.cameraController.prototype.GetState=function(){return{position:this.camera.position,rotation:this.camera.rotation}},this.cameraController.prototype.HitTestX=function(t){return t>=this.constraints.X1&&t<=this.constraints.X2},this.cameraController.prototype.HitTestY=function(t){return t>=this.constraints.Y1&&t<=this.constraints.Y2},this.cameraController.prototype.HitTestZ=function(t){return t>=this.constraints.Z1&&t<=this.constraints.Z2},this.cameraController.prototype.HitTestR=function(t){return t>=this.constraints.R1&&t<=this.constraints.R2},this.cityController=function(t){this.cities=[],this.city=void 0,this.dataController=t},this.cityController.prototype.SpawnCity=function(i,e,n){"undefined"==typeof sizeMultiplier&&(sizeMultiplier=1),"undefined"==typeof n&&(n=0);var s=0==this.cities.length?0:8*this.cities[0].width*this.cities.length,o=0==this.cities.length?0:this.cities[0].height/2;if(sizeMultiplier>1){var a=t.MultiplyArray(sizeMultiplier,e);buildingsPerRow*=sizeMultiplier,buildingsPerColumn*=sizeMultiplier,e=a}var r=new t.city(buildingsPerRow,buildingsPerColumn,dataController,e,sizeMultiplier,s,o,n);return r.tag=i,this.cities.push(r),r.index=this.cities.length,1==this.cities.length&&(this.city=r),r},this.cityController.prototype.SetCity=function(t){return"undefined"!=typeof t&&t.index&&t.index<=this.cities.length?(this.city=this.cities[t.index],1):(console.log("Error (cityController.SetCity): Tried to set a city with an out of range index"),0)},this.cityController.prototype.CityIsSpawned=function(t){return 0!==this.GetCityByTag(t)},this.cityController.prototype.SetCityByIndex=function(t){this.city=t<=this.cities.length?cities[t]:cities.length},this.cityController.prototype.SetCityByTag=function(t){var i=this.GetCityByTag(t);return i?(this.city=i,1):0},this.cityController.prototype.GetCityByID=function(t){return t<this.cities.length?this.cities[t]:city},this.cityController.prototype.GetCityByTag=function(t){if("string"==typeof t)for(var i in this.cities)if("undefined"!=typeof this.cities[i].tag&&this.cities[i].tag==t)return this.cities[i];return 0},this.city=function(t,i,e,n,s,o,a,r){"undefined"==typeof r&&(r=0),this.logMatrix=function(t){if(debug)for(var i in t)for(var e in i)console.log(t[i][e])},this.index=void 0,this.tag="default",this.buildings=[],this.buildingData=r?n:n.slice(),this.extents={X1:void 0,Y1:void 0,X2:void 0,Y2:void 0,Z1:void 0,Z2:void 0},this.origin={X:o,Y:a},this.width=0,this.height=0,this.midpoint={X:0,Y:0},this.buildingsPerRow=t,this.buildingsPerColumn=i,this.dataRef=e,r?this.init3DExplicit():this.init3DRandomized()},this.city.prototype.init3DExplicit=function(){camMinHeight=0,this.layoutData=dataController.NormalizeLayoutData(this.buildingData),this.buildingData=dataController.GetBuildingsFromTiles(this.layoutData);for(var i=0;i<=this.buildingData.length-1;i++){var e={},n=new t.building(this.buildingData[i]);if("undefined"!=typeof n){var s=this.layoutData.tiles[i].type,o=this.layoutData.types[s].h,a=this.layoutData.types[s].w,r=Math.random()*buildingHeightVariance+1*boxdepth*10;r/2+1>camMinHeight&&(camMinHeight=Math.ceil(r/2+1)),e.geometry=new THREE.BoxGeometry(a,o,r);var h=parseInt(n.hex_color,16);e.material=this.dataRef.GetMaterial(n,h),e.cube=new THREE.Mesh(e.geometry,new THREE.MeshFaceMaterial(e.material)),e.cube.castShadow=!0,e.cube.receiveShadow=!0,e.cube.name=n.id,scene.add(e.cube),e.cube.position.x=this.origin.X+this.layoutData.tiles[i].x+this.layoutData.types[s].w/2,e.cube.position.y=this.origin.Y+this.layoutData.tiles[i].y+this.layoutData.types[s].h/2,(e.cube.position.x+1.4*a<this.extents.X1||"number"!=typeof this.extents.X1)&&(this.extents.X1=e.cube.position.x+1.4*a),(e.cube.position.x-1.4*a>this.extents.X2||"number"!=typeof this.extents.X2)&&(this.extents.X2=e.cube.position.x-1.4*a),(e.cube.position.y+o/4<this.extents.Y1||"number"!=typeof this.extents.Y1)&&(this.extents.Y1=e.cube.position.y+o/4),(e.cube.position.y-o/4>this.extents.Y2||"number"!=typeof this.extents.Y2)&&(this.extents.Y2=e.cube.position.y-o/4),(e.cube.position.z-r/2<this.extents.Z1||"number"!=typeof this.extents.Z1)&&(this.extents.Z1=e.cube.position.z+r/3),n.SetModel(e.cube),this.buildings[parseInt(n.id)]=n,objects.push(e.cube)}else console.log("warning: tried to spawn invalid building)")}this.midpoint.X=(this.extents.X2+this.extents.X1)/2,this.midpoint.Y=(this.extents.Y2+this.extents.Y1)/2,this.width=Math.abs(this.extents.X1-this.extents.X2),this.height=Math.abs(this.extents.Y1-this.extents.Y2),this.extents.Z2=this.extents.Z1+camZ2Extents},this.city.prototype.init3DRandomized=function(){var i=gridSizex-boxwidth,e=gridSizey-boxheight,n=jitterX,s=jitterY;this.drawMatrix=math.zeros(this.buildingsPerRow,this.buildingsPerColumn),this.dataMatrix=math.zeros(1,this.buildingData.length),camMinHeight=0;for(var o=this.buildingData.length,a=!1,r=0,h=1;h<=this.buildingsPerColumn;h++){for(var d=this.buildingsPerRow;d>=1;d--){var u={},l=new t.building(this.buildingData[r]);if("undefined"==typeof l){a=!0;break}for(var c=!1,p=!1,f=0;f<l.xsize;f++){for(var y=0;y<l.ysize&&(h+y-1<this.buildingsPerColumn&&this.buildingsPerRow-d+f<this.buildingsPerRow?this.drawMatrix.subset(math.index(h+y-1,this.buildingsPerRow-d+f))>0&&(debug&&debugGrid&&console.log("found tile extending into occupied index"),p=!0,c=!0):c=!0,!c);y++);if(c)break}if(!p){for(var f=0;f<l.xsize;f++)for(var y=0;y<l.ysize;y++)h+y-1<this.buildingsPerColumn&&this.buildingsPerRow-d+f<this.buildingsPerRow&&this.drawMatrix.subset(math.index(h+y-1,this.buildingsPerRow-d+f),Math.max(l.xsize,l.ysize));this.buildingData.splice(r,1),n*=-1,s*=-1;var m=e*(l.ysize-1)+boxheight*l.ysize,g=i*(l.xsize-1)+boxwidth*l.xsize,x=Math.random()*buildingHeightVariance+1*boxdepth*10;x/2+1>camMinHeight&&(camMinHeight=Math.ceil(x/2+1)),u.geometry=new THREE.BoxGeometry(g,m,x);var b=parseInt(l.hex_color,16);if(u.material=this.dataRef.GetMaterial(l,b),u.cube=new THREE.Mesh(u.geometry,new THREE.MeshFaceMaterial(u.material)),u.cube.castShadow=!0,u.cube.receiveShadow=!0,u.cube.name=l.id,scene.add(u.cube),u.cube.position.x=this.origin.X+(-d*gridSizex- -(l.xsize-1)*gridSizex/2+n),u.cube.position.y=this.origin.Y+(-h*gridSizey-(l.ysize-1)*gridSizey/2+s),(u.cube.position.x+1.4*g<this.extents.X1||"number"!=typeof this.extents.X1)&&(this.extents.X1=u.cube.position.x+1.4*g),(u.cube.position.x-1.4*g>this.extents.X2||"number"!=typeof this.extents.X2)&&(this.extents.X2=u.cube.position.x-1.4*g),(u.cube.position.y+m/4<this.extents.Y1||"number"!=typeof this.extents.Y1)&&(this.extents.Y1=u.cube.position.y+m/4),(u.cube.position.y-m/4>this.extents.Y2||"number"!=typeof this.extents.Y2)&&(this.extents.Y2=u.cube.position.y-m/4),(u.cube.position.z-x/2<this.extents.Z1||"number"!=typeof this.extents.Z1)&&(this.extents.Z1=u.cube.position.z+x/3),l.SetModel(u.cube),this.buildings[parseInt(l.id)]=l,objects.push(u.cube),debug&&debugGrid&&this.logMatrix(this.drawMatrix),debug&&debugGrid&&this.logMatrix(this.dataMatrix),a)break}}if(a)break}this.midpoint.X=(this.extents.X2+this.extents.X1)/2,this.midpoint.Y=(this.extents.Y2+this.extents.Y1)/2,this.width=Math.abs(this.extents.X1-this.extents.X2),this.height=Math.abs(this.extents.Y1-this.extents.Y2),this.extents.Z2=this.extents.Z1+camZ2Extents},this.building=function(t){"undefined"!=typeof t&&(this.xsize="undefined"==typeof t.xsize?void 0:t.xsize,this.ysize="undefined"==typeof t.ysize?void 0:t.ysize,this.id="undefined"==typeof t.id?void 0:t.id,this.title="undefined"==typeof t.title?void 0:t.title,this.description="undefined"==typeof t.description?void 0:t.description,this.tags="undefined"==typeof t.tags?void 0:t.tags,this.img="undefined"==typeof t.img?void 0:t.img,this.hex_color="undefined"==typeof t.hex_color?void 0:t.hex_color),this.model=void 0},this.building.prototype.SetModel=function(t){this.model=t}};