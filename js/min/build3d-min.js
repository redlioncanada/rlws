function moveCamX(e){camera.position.x+=e,light.position.x+=e}function moveCamY(e){camera.position.y+=e,light.position.y+=e}function render(){requestAnimationFrame(render),overlay||(mRIGHT&&moveCamX(.1),mLEFT&&moveCamX(-.1),mUP&&moveCamY(.1),mDOWN&&moveCamY(-.1),mGOIN&&(camera.position.z-=.1),mGOOUT&&(camera.position.z+=.1),xMove&&moveCamX(xMove/200*-1),yMove&&moveCamY(yMove/200),mROTUP&&camera.rotation.x<.9&&(camera.rotation.x+=.03),mROTDOWN&&camera.rotation.x>0&&(camera.rotation.x-=.03),renderer.render(scene,camera))}function boxClicked(e){console.log(glCards[parseInt(e.name)]),$("#blackout").css({display:"block"}).animate({opacity:1},500),overlay=!0,$("#overlay").html("box clicked: "+e.name+"<br>Content title: "+glCards[parseInt(e.name)].title+"<br>Description: "+glCards[parseInt(e.name)].description+'<br>Image: <img src="'+glCards[parseInt(e.name)].img+'">'),$("#blackout").on("click touchend",function(e){$(this).animate({opacity:0},500,function(){$("#blackout").css({display:"none"}),overlay=!1}),$(this).unbind("click")})}function fingerMouseDown(e){if(e.preventDefault(),isMobile)if(2==e.touches.length)console.log(e.touches);else{var n=e.touches[0];oldTouchX=n.pageX,oldTouchY=n.pageY}else oldTouchX=e.clientX,oldTouchY=e.clientY;mTouchDown=!0}function fingerMouseDrag(e){if(e.preventDefault(),isMobile){var n=e.touches[0];xMove=n.pageX-oldTouchX,oldTouchX=n.pageX,yMove=n.pageY-oldTouchY,oldTouchY=n.pageY}else mTouchDown&&(xMove=e.clientX-oldTouchX,oldTouchX=e.clientX,yMove=e.clientY-oldTouchY,oldTouchY=e.clientY)}function fingerMouseUp(e){e.preventDefault();var n,o,i;if(isMobile?(n=e.pageX/window.innerWidth*2-1,o=2*-(e.pageY/window.innerHeight)+1,i=new THREE.Vector3(n,o,.5)):(n=e.clientX/window.innerWidth*2-1,o=2*-(e.clientY/window.innerHeight)+1,i=new THREE.Vector3(n,o,.5)),1>xMove&&xMove>-1&&1>yMove&&yMove>-1&&!pinched){var t=new THREE.Raycaster;i.unproject(camera),t.set(camera.position,i.sub(camera.position).normalize());var a=t.intersectObjects(objects);a.length>0&&boxClicked(a[0].object)}xMove=0,yMove=0,mTouchDown=!1,oldScale=0,pinched=!1}function zoomHandler(e){var n=Math.max(-.1,Math.min(.1,e.wheelDelta||-e.detail));(camera.position.z>camMinHeight&&n>0||camera.position.z<camMaxHeight&&0>n)&&(camera.position.z-=n)}function resetPinches(){$(document).on("pinchstart",function(e){oldScale=0,pinched=!0}),$(document).on("pinchmove",function(e){pinched=!0;var n=e.scale-oldScale;oldScale=e.scale,camera.position.z<camMaxHeight&&0>n?(camera.position.z+=.1,console.log("zoom out, delta: "+n)):camera.position.z>camMinHeight&&n>0&&(camera.position.z-=.1,console.log("zoom in, delta: "+n))}),$(document).on("pinchend",function(e){oldScale=0,pinched=!1,$(document).off("pinchstart pinchmove pinchend"),resetPinches()})}function init3D(){var e=new THREE.PlaneBufferGeometry(100,100),n=new THREE.MeshPhongMaterial({color:16776690,side:THREE.DoubleSide}),o=new THREE.Mesh(e,n);scene.add(o),o.position.z=-.2,light=new THREE.PointLight(16777215,1,50),light.position.set(0,0,4),scene.add(light),camera.position.z=5,initInterval=setInterval(function(){glCards.length>0&&(clearInterval(initInterval),initBuildings())},500),render()}function initBuildings(){var e=math.zeros(maxX,maxY),n=math.zeros(1,glCards.length);console.log(glCards);var o=!1;camMinHeight=0;for(var i=1;maxY>=i;i++){for(var t=maxX;t>=1;t--){var a={},r=i*maxY-t,c=glCards[r];if("undefined"==typeof c){o=!0;break}if(1!=e.subset(math.index(i-1,maxX-t))){e.subset(math.index(i-1,maxX-t),1);var m;if(c.ysize>1)for(m=1;m<=c.xsize;m++)e.subset(math.index(i+m-1,maxX-t),1);if(c.xsize>1)for(m=1;m<=c.ysize;m++)e.subset(math.index(i-1,maxX-t+m),1);n.subset(math.index(0,r),1);var l=gutterY*(c.ysize-1)+boxheight*c.ysize,s=gutterX*(c.xsize-1)+boxwidth*c.xsize,h=3*Math.random()+1;h/2+1>camMinHeight&&(camMinHeight=Math.ceil(h/2+1)),a.geometry=new THREE.BoxGeometry(s,l,h);var d=colors[Math.round(Math.random())];if(a.material=[new THREE.MeshLambertMaterial({color:d}),new THREE.MeshLambertMaterial({color:d}),new THREE.MeshLambertMaterial({color:d}),new THREE.MeshLambertMaterial({color:d}),new THREE.MeshLambertMaterial({map:THREE.ImageUtils.loadTexture(c.img)}),new THREE.MeshLambertMaterial({color:d})],a.material[4].minFilter=THREE.NearestFilter,a.cube=new THREE.Mesh(a.geometry,new THREE.MeshFaceMaterial(a.material)),a.cube.name=r,scene.add(a.cube),objects.push(a.cube),a.cube.position.x=-t*gridSizex-(c.xsize-1)*gridSizex/2,a.cube.position.y=-i*gridSizey-(c.ysize-1)*gridSizey/2,o)break}}if(o)break}console.log("camera max: "+camMaxHeight+" min: "+camMinHeight)}function logMatrix(e){for(var n in e)for(var o in n)console.log(e[n][o])}var mUP=!1,mDOWN=!1,mRIGHT=!1,mLEFT=!1,mGOIN=!1,mGOOUT=!1,mROTUP=!1,mROTDOWN=!1,isMobile=/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent),camera=new THREE.PerspectiveCamera(60,window.innerWidth/window.innerHeight,1,1e4),scene=new THREE.Scene;scene.fog=new THREE.FogExp2(16776690,.18);var renderer=new THREE.WebGLRenderer({antialias:!0}),light=null,camMaxHeight=6.5,camMinHeight,objects=[],gridSizex=1.2,gridSizey=1.5,maxX=6,maxY=6,colors=[14755101,3909315],boxheight=1.3,boxwidth=1,gutterX=gridSizex-boxwidth,gutterY=gridSizey-boxheight,oldTouchX=0,oldTouchY=0,xMove=0,yMove=0,mTouchDown=!1,mTouchMove=!1,overlay=!1,oldScale=0,pinched=!1,initInterval;renderer.setSize(window.innerWidth,window.innerHeight),renderer.shadowMapEnabled=!0,document.body.appendChild(renderer.domElement),$(document).keydown(function(e){38==e.which&&(e.preventDefault(),mUP=!0),40==e.which&&(e.preventDefault(),mDOWN=!0),37==e.which&&(e.preventDefault(),mLEFT=!0),39==e.which&&(e.preventDefault(),mRIGHT=!0),34==e.which&&(e.preventDefault(),mGOIN=!0),33==e.which&&(e.preventDefault(),mGOOUT=!0),36==e.which&&(e.preventDefault(),mROTUP=!0),35==e.which&&(e.preventDefault(),mROTDOWN=!0)}),$(document).keyup(function(e){38==e.which&&(e.preventDefault(),mUP=!1),40==e.which&&(e.preventDefault(),mDOWN=!1),37==e.which&&(e.preventDefault(),mLEFT=!1),39==e.which&&(e.preventDefault(),mRIGHT=!1),34==e.which&&(e.preventDefault(),mGOIN=!1),33==e.which&&(e.preventDefault(),mGOOUT=!1),36==e.which&&(e.preventDefault(),mROTUP=!1),35==e.which&&(e.preventDefault(),mROTDOWN=!1)}),resetPinches(),document.addEventListener("touchstart",fingerMouseDown),document.addEventListener("mousedown",fingerMouseDown),document.addEventListener("touchend",fingerMouseUp),document.addEventListener("mouseup",fingerMouseUp),document.addEventListener("touchmove",fingerMouseDrag),document.addEventListener("mousemove",fingerMouseDrag),document.addEventListener("mousewheel",zoomHandler);