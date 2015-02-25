//MODIFIABLE

//box vars
var gridSizex = 1.2; //multiplicative
var gridSizey = 1.5; //multiplicative
var maxX = 6; //maximum x grid elements
var maxY = 6; //maximum y grid elements
var boxheight = 1.3; //multiplicative
var boxwidth = 1; //multiplicative
var jitterX = 0.0; //grid jitter
var jitterY = 0.0; //grid jitter
var colors = [0xe1251d,0x3ba6c3]; //possible box colors, randomly chosen

//cam vars
var camMaxHeight = 6.5;	//maximum camera z
var camX1Extents = 0.8; //affects how far outside the current grid that the camera can scroll, left
var camX2Extents = 0.6; //affects how far outside the current grid that the camera can scroll, right
var camY1Extents = 2.8;	//affects how far outside the current grid that the camera can scroll, up
var camY2Extents = 1.6;	//affects how far outside the current grid that the camera can scroll, down
var camZStart = 15;
var camZEnd = 5;
var camZAnimationTime = 2;

//NON-MODIFIABLE
var camMinHeight, camMinX, camMaxX, camMinY, camMaxY;
var originX, originY;