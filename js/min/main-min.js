function render(){requestAnimationFrame(render),TWEEN.update(),Math.abs(camera.position.y)>=Math.abs(originY-camY2Extents)&&(mDOWN=!1),Math.abs(camera.position.y)<=Math.abs(originY+camY1Extents)&&(mUP=!1),Math.abs(camera.position.x)>=Math.abs(originX-camX1Extents)&&(mLEFT=!1),Math.abs(camera.position.x)<=Math.abs(originX+camX2Extents)&&(mRIGHT=!1),overlay||(!xMove&&mRIGHT&&animations.CameraPanX(.1,void 0,camPanAnimationTime),!xMove&&mLEFT&&animations.CameraPanX(-.1,void 0,camPanAnimationTime),!yMove&&mUP&&animations.CameraPanY(.1,void 0,camPanAnimationTime),!yMove&&mDOWN&&animations.CameraPanY(-.1,void 0,camPanAnimationTime),mGOIN&&animations.CameraZoom(.1),mGOOUT&&animations.CameraZoom(-.1),xMove&&(mLEFT||mRIGHT)&&animations.CameraPanX(xMove/200*-1,void 0,camPanAnimationTime),yMove&&(mUP||mDOWN)&&animations.CameraPanY(yMove/200,void 0,camPanAnimationTime),mROTUP&&camera.rotation.x<.9&&(camera.rotation.x+=.03),mROTDOWN&&camera.rotation.x>0&&(camera.rotation.x-=.03),renderer.render(scene,camera))}function init3D(){var a=new THREE.PlaneBufferGeometry(100,100),e=new THREE.MeshPhongMaterial({color:16776690,side:THREE.DoubleSide}),i=new THREE.Mesh(a,e);scene.add(i),i.position.z=-.2,light=new THREE.PointLight(16777215,1,50),light.position.set(0,0,4),scene.add(light),camera.position.z=camZStart,initInterval=setInterval(function(){if(glCards.length>0){var a=gridSizex-boxwidth,e=gridSizey-boxheight,i=maxX*(gridSizex+a),n=maxY*(gridSizey+e);camera.position.y=-(n/2),light.position.y=-(n/2),camera.position.x=-(i/2),light.position.x=-(i/2),camMinX=-i-camX1Extents,camMaxX=0+camX2Extents,camMinY=-n-camY1Extents,camMaxY=0+camY2Extents,originX=camera.position.x,originY=camera.position.y,animations.CameraZoom(camZEnd,void 0,camZAnimationTime,!0),clearInterval(initInterval),cityController.SpawnCity(),setupEventListeners()}},500),render()}var isMobile=/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent),camera=new THREE.PerspectiveCamera(60,window.innerWidth/window.innerHeight,1,1e4),scene=new THREE.Scene;scene.fog=new THREE.FogExp2(16776690,.18);var renderer=new THREE.WebGLRenderer({antialias:!0}),light=null,initInterval,objs=new _objects,cityController=new objs.cityController,animations=new objs.animations,objects=[];renderer.setSize(window.innerWidth,window.innerHeight-73),renderer.shadowMapEnabled=!0,document.body.appendChild(renderer.domElement);