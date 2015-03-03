//MODIFIABLE

//box vars
var gridSizex = 1.2; //multiplicative
var gridSizey = 1.6; //multiplicative
var maxX = 6; //maximum x grid elements
var maxY = 6; //maximum y grid elements
var boxheight = 1.4; //multiplicative
var boxwidth = 1; //multiplicative
var jitterX = 0.0; //grid jitter
var jitterY = 0.0; //grid jitter
var colors = [0xe1251d,0x3ba6c3]; //possible box colors, randomly chosen
var glCards = [];
var glCards2 = [];

//cam vars
var camMaxHeight = 6.5;	//maximum camera z
var camX1Extents = 0.8; //affects how far outside the current grid that the camera can scroll, left
var camX2Extents = 0.6; //affects how far outside the current grid that the camera can scroll, right
var camY1Extents = 2.8;	//affects how far outside the current grid that the camera can scroll, up
var camY2Extents = 1.6;	//affects how far outside the current grid that the camera can scroll, down

//camera zoom animation
var camZStart = 15;
var camZEnd = 5;
var camZAnimationTime = 2;

//camera pan animation
var camPanAnimationTime = 0.01;

//NON-MODIFIABLE
var camMinHeight, camMinX, camMaxX, camMinY, camMaxY;
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
