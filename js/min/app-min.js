var glCards=[],boxid=0,loadInterval,app=angular.module("redLion",["ngRoute"]);app.config(["$routeProvider",function(t){t.when("/grid",{template:" ",controller:"GridControler"}).when("/work/:campaignID/:subSection",{templateUrl:"templates/work.html",controller:"WorkCtrl"}).when("/disciplines/:disciplineID",{templateUrl:"templates/discipline.html",controller:"DisciplineCtrl"}).when("/news/:newsID",{templateUrl:"templates/news.html",controller:"NewsCtrl"}).otherwise({redirectTo:"/grid"})}]),app.controller("CardTestController",function(t,e,n){t.cards=e.get(),init3D()}),app.factory("Cards",function(t){var e=[];return{get:function(){return 0===e.length&&t.get("http://redlioncanada.com/api/content/").success(function(t){for(var n=0,i=t.length;i>n;n++)e.push(t[n])}).error(function(t){alert("ERROR: "+t)}),glCards=e,e}}}),app.controller("GridControler",function(t){console.log("grid connection")}),app.controller("NewsCtrl",["$scope","$routeParams","$timeout","$sce",function(t,e,n,i){t.dslug=e.newsID,$("#blackout").css({display:"block"}),$("#blackout").animate({opacity:1,"padding-top":0},1e3,"easeOutCubic"),closeButtonStart(),t.outputHTML=function(t){return i.trustAsHtml(t)},0!==boxid?(t.newsitem=dataController.GetBySlug(t.dslug),t.newsitem.date_launched=Date.parse(t.newsitem.date_launched)):n(function(){t.newsitem=dataController.GetBySlug(t.dslug),t.newsitem.date_launched=Date.parse(t.newsitem.date_launched)},1e3)}]),app.controller("WorkCtrl",["$scope","$routeParams","$sce","$timeout",function(t,e,n,i){t.campaignID=e.campaignID,t.startSection=e.subSection,0!==boxid?getWorkData(t,n,i):i(function(){dataController.GetBySlug(t.campaignID)!==!1&&(getWorkData(t,n,i,!0),clearInterval(loadInterval))},1e3)}]);var audioPlayerStart=function(){var t=document.getElementsByClassName("audio_file");$(".play-pause-btn").click(function(){var t=$(this).siblings("audio").get(0);t.paused?(t.play(),$(this).attr("src","img/pause-btn.gif")):(t.pause(),$(this).attr("src","img/play-btn.gif"))}),$(".rwd-btn").click(function(){var t=$(this).siblings("audio").get(0);t.currentTime=0}),$(".ffwd-btn").click(function(){var t=$(this).siblings("audio").get(0);t.currentTime+=5});for(var e=0;e<t.length;e++){var n=t[e];setTimeout(audioLoadTimeout,200,n),n.addEventListener("timeupdate",function(t){var e=$(n).siblings("div.meter")[0],i=$(e).children("span")[0],o=n.currentTime/n.duration*100;$(i).css("width",o+"%");var a=$(n).siblings(".time-readout")[0],r=$(a).children(".audioCurrent")[0];$(r).text(getMinSec(n.currentTime))},!1),n.addEventListener("ended",function(t){n.pause()},!1)}},audioLoadTimeout=function(t){var e=$(t).siblings(".time-readout")[0],n=$(e).children(".audioTotal")[0];$(n).text(getMinSec(t.duration))},getMinSec=function(t){var e=Math.floor(t/60),n=parseInt(t-60*e);return 10>n&&(n="0"+n),e+":"+n},getWorkData=function(t,e,n,i){t.work=i?dataController.GetBySlug(t.campaignID):dataController.GetByID(boxid),$("#blackout").css({display:"block"}),$("#blackout").animate({opacity:1,"padding-top":0},1e3,"easeOutCubic"),t.work.date_launched=Date.parse(t.work.date_launched);for(var o=t.work.video_comsep,a=0;a<o.length;a++)""!==t.work.video_comsep[a]&&(t.work.video_comsep[a]=e.trustAsResourceUrl(t.work.video_comsep[a]));closeButtonStart(),audioPlayerStart();var r={dots:!0,infinite:!0,speed:500,slidesToShow:1,adaptiveHeight:!0};""!==t.work.print_comsep[0]&&n(function(){$(".printwork").slick(r)},500),""!==t.work.digital_comsep[0]&&n(function(){$(".digitalwork").slick(r)},500)};app.controller("DisciplineCtrl",["$scope","$routeParams","$timeout",function(t,e,n){t.dslug=e.disciplineID,$("#blackout").css({display:"block"}),$("#blackout").animate({opacity:1,"padding-top":0},1e3,"easeOutCubic"),closeButtonStart(),0!==boxid?t.disciplines=dataController.GetByType("disciplines"):n(function(){t.disciplines=dataController.GetByType("disciplines")},1e3),n(function(){$(".dcontainer."+t.dslug+" p").slideDown(),$(".dcontainer."+t.dslug+" h1").addClass("selected"),$(".dcontainer."+t.dslug+" h1 span").html("-"),$(".dcontainer h1").click(function(){$(this).hasClass("selected")||($(".dcontainer p").slideUp(),$(".dcontainer h1").removeClass("selected"),$(".dcontainer h1 span").html("+"),$(this).addClass("selected"),$(this).children("span").html("-"),$(this).siblings("p").slideDown())})},1200)}]);var closeButtonStart=function(){$(".close").on("click",function(t){t.preventDefault(),$("#blackout").animate({opacity:0,"padding-top":50},1e3,"easeInCubic",function(){$(this).css({display:"none"}),window.location.href="#/grid"})})};