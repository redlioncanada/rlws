function resize(){camera.aspect=canvasDiv.width()/canvasDiv.height(),renderer.setSize(canvasDiv.width(),canvasDiv.height()),camera.updateProjectionMatrix()}function render(){requestAnimationFrame(render),TWEEN.update();var e=(new Date).getTime()/1e3;if(frameTime=e-currentTime,currentTime=e,totalTime+=frameTime,!overlay){var a=xMove?-(xMove/200):.1;mLEFT&&!xMove&&(a*=-1);var r=yMove?yMove/200:.1;mDOWN&&!yMove&&(r*=-1),(mLEFT||mRIGHT)&&cameraController.Move(a,void 0,void 0,!1),(mUP||mDOWN)&&cameraController.Move(void 0,r,void 0,!1),mGOIN&&cameraController.Zoom(.1),mGOOUT&&cameraController.Zoom(-.1),mROTUP&&cameraController.Rotate(.03,void 0,void 0,!1),mROTDOWN&&cameraController.Rotate(-.03,void 0,void 0,!1),composer.render(.1)}}function init3D(){if(Detector.webgl){resize(),composer=new THREE.EffectComposer(renderer);var e=new THREE.RenderPass(scene,camera);composer.addPass(e);var a=new THREE.ShaderPass(THREE.VignetteShader);a.uniforms.darkness.value=1.5,composer.addPass(a),hblurPass=new THREE.ShaderPass(THREE.HorizontalBlurShader),hblurPass.uniforms.h.value=0,composer.addPass(hblurPass),vblurPass=new THREE.ShaderPass(THREE.VerticalBlurShader),vblurPass.uniforms.v.value=0,composer.addPass(vblurPass);var r=new THREE.ShaderPass(THREE.CopyShader);r.renderToScreen=!0,composer.addPass(r);var o=new THREE.ImageUtils.loadTexture("testclou2.png"),t=new THREE.MeshBasicMaterial({map:o});t.transparent=!0;var n=new THREE.PlaneBufferGeometry(64,64,1,1);cloud1=new THREE.Mesh(n,t),cloud1.position.set(15,15,30),scene.add(cloud1),cloud2=new THREE.Mesh(n,t),cloud2.position.set(2,0,38),cloud2.rotation.z=3.5,scene.add(cloud2),cloud3=new THREE.Mesh(n,t),cloud3.position.set(30,2,45),scene.add(cloud3);var s=new THREE.PlaneBufferGeometry(1e4,1e4),i=new THREE.MeshBasicMaterial({color:0,side:THREE.DoubleSide});plane=new THREE.Mesh(s,i),scene.add(plane),plane.position.z=12;var l=new THREE.ObjectLoader;l.load("models/rllogo2.json",function(e){scene.add(e),e.position.set(-300,-90,80),e.scale.set(.5,.5,.5)}),spotLight.position.set(0,40,80),spotLight.target.position.set(40,0,0),spotLight.intensity=.8,spotLight.castShadow=!0,spotLight.shadowDarkness=.3,spotLight.shadowMapWidth=1024,spotLight.shadowMapHeight=1024,spotLight.shadowCameraNear=10,spotLight.shadowCameraFar=4e4,spotLight.shadowCameraFov=30,scene.add(spotLight),hemilight=new THREE.HemisphereLight(10011597,16776690,.3),scene.add(hemilight),cameraController=new objs.cameraController(renderer,scene,camera),initInterval=setInterval(function(){glCards.length>0&&(clearInterval(initInterval),dataController.SetData(glCards),setTimeout(function(){$("#loading").fadeOut(),SpawnAndGoToCity(homeKeyword)},1e3))},500),render()}}function SpawnAndGoToCity(e){"undefined"==typeof abs&&(abs=!1);var a=cityController.CityIsSpawned(e);if(a)var r=cityController.GetCityByTag(e);else if(e==homeKeyword)var o=layout,r=cityController.SpawnCity(e,o,1);else{var o=dataController.GetAllWithTag(e);if(!o||!o.length)return void 0;var r=cityController.SpawnCity(e,o)}return o&&(o.length||Object.keys(o).length)||a?(cityController.SetCity(r),cameraController.CenterOnCity(r),r):void 0}var canvasDiv=$("#canvas"),canvas=canvasDiv.get(0),camera=new THREE.PerspectiveCamera(camFOVStart,canvasDiv.width()/canvasDiv.height(),1,300),scene=new THREE.Scene,mouse=new THREE.Vector2,intersected,raycaster=new THREE.Raycaster,renderer=new THREE.WebGLRenderer({antialias:!0}),spotLight=new THREE.SpotLight(16777215),hemilight=null,lightintensity=40,composer,hblurPass,vblurPass,initInterval,objects=[],objs=new _objects,dataController=new objs.dataController,cityController=new objs.cityController(dataController),cameraController=null,fuse,controlsinit=!1,plane;renderer.shadowMapEnabled=!0,$(window).on("resize",resize);var cloud2;