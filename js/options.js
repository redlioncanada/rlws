//MODIFIABLE

//debug
var debug = true;
var debugMovement = false;
var debugGrid = false;
var debugIndicator = false;

//search
var homeKeyword = "home";
var pageTitle = "Red Lion {REDEFINE}";

//city vars
var gridSizex = 1.2; //multiplicative
var gridSizey = 1.6; //multiplicative
var buildingsPerRow = 5; //maximum x grid elements
var buildingsPerColumn = 5; //maximum y grid elements
var buildingHeightVariance = 4;
var maxSpawnedCities = 10;
var boxheight = 1.4; //multiplicative
var boxwidth = 1; //multiplicative
var boxdepth = 3; //multiplicative
var jitterX = 0.0; //grid jitter
var jitterY = 0.0; //grid jitter
var cityGutter = 4;
var colors = [0xe1251d,0x3ba6c3]; //possible box colors, randomly chosen
var glCards = [];
var glCards2 = [];
var cityCirclePadding = 0.5;
var cityCircleThickness = 1;
var subCityCirclePadding = 3;
var subCityCircleThickness = 0.5;
var mainCityRadius = 1.8; //multiplicative
var outerCityRadius = 0.6; // multiplicative
var defaultCityCircleCount = 12; //determines how many cities are placed in a circle before drawing a new one
var defaultCityCircleCountModifier = 4; //gets added to defaultCityCircleCount each time there's a new circle
var groundZ = 12;

var spotlightOffset = { x : 5, y : 5, z : 15 };
var surroundingTags = [ "design", "digital", "design", "design", "digital", "design", "design", "digital", "design", "design", "digital", "design" ];

//cam vars
var camXExtents = 200; //affects how far outside the current grid that the this.camera can scroll, left&right
var camYExtents = 200;	//affects how far outside the current grid that the this.camera can scroll, up&down
var camZ1Extents = -7.5;
var camZ2Extents = 20;
var camRotateMin = 0.0;
var camRotateMax = 0.9;
var camFOVMin = 10;
var camFOVMax = 90;
var camFOVStart = 80;

//camera zoom animation
var camZStart = 4; //multiplied with the highest building depth
var camZEnd = 5; //subtracted from city.extents.z2
var camZAnimationTime = 5;

//camera pan animation
var camPanAnimationTime = 0.01;
var camPanToCityAnimationTime = 1;

//movement
var singleClickTimeout = 0.7; //in seconds

// Overlay build timing (millisecs)
var overlayanimationdelay = 150;
var overlaybuildtime = 250;

//NON-MODIFIABLE
var camMinHeight, camMinX, cambuildingsPerRow, camMinY, cambuildingsPerColumn;
var originX, originY;
var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);
var isiOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

// Rudimentary Controls with keyboard vars
var mUP = false;
var mDOWN = false;
var mRIGHT = false;
var mLEFT = false;
var mGOIN = false;
var mGOOUT = false;
var mROTUP = false;
var mROTDOWN = false;

// Touch Events vars
var oldTouchX = 0;
var oldTouchY = 0;
var xMove = 0;
var yMove = 0;
var mTouchDown = false;
var mTouchMove = false;
var overlay = false;
var oldScale = 0;
var pinched = false;
var canvas;
var mouseDownTimeout = false;
var didSingleClick = false;

// Acceleration Vars
var acc_oldaz = null;
var acc_az = 0;
var acc_arAlpha = 0;
var acc_arBeta = 0;
var acc_speed = 5;

var acc_fromx = null;
var acc_tox = null;
var acc_fromy = null;
var acc_toy = null;
var acc_totilt = null;
var acc_fromtilt = null;

// Physics vars
var totalTime = 0;
var currentTime = new Date().getTime() / 1000;
var frameTime = 0;
