var app=angular.module("myApp",[]);app.controller("CardTestController",function(r,t,n){glCards=t.get()}),app.factory("Cards",function(r){var t=[];return{get:function(){return 0===t.length?(r.get("data/jsontest.php").success(function(r){for(var n=0,a=r.length;a>n;n++)t.push(r[n]);return init3D(),glCards}).error(function(r){return alert("ERROR: "+r),[]}),glCards=t,t):void 0}}});