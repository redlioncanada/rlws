window.navigator.userAgent.indexOf("MSIE ")||(THREE.AudioListener=function(){THREE.Object3D.call(this),this.type="AudioListener",this.context=new(window.AudioContext||window.webkitAudioContext)},THREE.AudioListener.prototype=Object.create(THREE.Object3D.prototype),THREE.AudioListener.prototype.constructor=THREE.AudioListener,THREE.AudioListener.prototype.updateMatrixWorld=function(){var t=new THREE.Vector3,e=new THREE.Quaternion,o=new THREE.Vector3,i=new THREE.Vector3,n=new THREE.Vector3,r=new THREE.Vector3;return function(E){THREE.Object3D.prototype.updateMatrixWorld.call(this,E);var s=this.context.listener,c=this.up;this.matrixWorld.decompose(t,e,o),i.set(0,0,-1).applyQuaternion(e),n.subVectors(t,r),s.setPosition(t.x,t.y,t.z),s.setOrientation(i.x,i.y,i.z,c.x,c.y,c.z),s.setVelocity(n.x,n.y,n.z),r.copy(t)}}());