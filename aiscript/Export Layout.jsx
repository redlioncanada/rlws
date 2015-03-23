// Export Layout - Adobe Illustrator Script
// Description: Export x and y coordinates to JSON
// Requirements: Adobe Illustrator CS4 or greater
// Version: 1.0-beta8
// ===============================================================================
/*

    This script will output a JSON tree representing the content.
    Layers , Groups, and PageItems  are arranged in a tree,
    those with #tags in the name are labeled as UI elements
    @tags are used to specifiy alignment to the parent
    All coordinates are absolute


*/

// Enables double-click launching from the Mac Finder or Windows Explorer
#target illustrator

// Set active Document variable and decode name for output
// Define the rect bounds of the artboard
var document = app.activeDocument;
var documentName = decodeURI(activeDocument.name);
//var colorSpace = document.DocumentColorSpace.RGB;
var dX = document.artboards[0].artboardRect[0];
var dY = document.artboards[0].artboardRect[3];
var dX2 = document.artboards[0].artboardRect[2];
var dY2 = document.artboards[0].artboardRect[1];

// Layer variables
var layerNum = 0;

// Tag variables
var types = [];
var nameO = []; // is strings without tags
var id = []; // $identifier
var type = []; // #type
var align = []; /* @align */
var attach = []; // %attach
var variable = []; // &variable

// Define varible for object position
var output = "";

// Automatically indent JSON output
var tabCount = 0;

// PNG option variables
var options = new ExportOptionsPNG24();
options.antiAliasing = true;
options.transparency = true;
options.artBoardClipping = true;
var pngNum = 0;

// Color variables
fillColor = [];
strokeColor = [];

// Text variables
var fontFamily = [];
var fontStyle = [];
var fontSize = [];
var fontJustification = [];
var fontFillColor = [];
var fontStrokeColor = [];
var fontStrokeWeight = [];
//~ var kerning = [];
//~ var kerningMethod = [];
var tracking = [];
var leading = [];
var textContent = [];


/*____________________________________

          Tab

adds to output the given string with current indentation
____________________________________*/
function tab(s) {
    for ( var t = 0; t< tabCount; t++ ) {
      output += "   ";
    }

    if ( s !== 'undefined' ) {
      output += s;
    }
}

/*____________________________________

        Process Document

Prints Names of all the sublayers
and the items on the layers
____________________________________*/
function processDocument(D) {
  //tab("{\n");
  //tabCount+=1;

  //Maybe here we rasterize the index list of pageObject
  //traversePageItems(layer);
  //tab("[\n");

  traverseLayers(D);
  //tab("]\n");

  //tabCount-=1;
  //tab("}\n");
}
/*______________________

  Translate Tag
________________________*/
function translateTag(t) {
  if ( t === "#btn" ) {
    return "button";
  }

  if ( t === "btn" ) {
    return "button";
  }

  if ( t === "#btnToggle" ) {
    return "toggle";
  }

  if ( t === "btnToggle" ) {
    return "toggle";
  }

  if ( t === "#icon" ) {
    return "image";
  }

  if ( t === "icon" ) {
    return "image";
  }

  if ( t === "#txt" ) {
    return "text";
  }

  if ( t === "txt" ) {
    return "text";
  }

  if ( t === "#text" ) {
    return "text";
  }

  if ( t === "#valueBar" ) {
    return "valueBar";
  }

  if ( t === "#fillingBar" ) {
    return "fillingBar";
  }

  if ( t === "#rectangle" ) {
    return "rectangle";
  }

  if ( t === "#bg" ) {
    return "rectangle";
  }

  if ( t === "bg" ) {
    return "rectangle";
  }

  return t;
}
/*__________________________________________

      Number Of Visible Pages
__________________________________________*/
function numberOfVisiblePageItems(layer) {
  num = 0;
  for ( var i =0; i<layer.pageItems.length; i++ ) {
    if ( !layer.pageItems[i].hidden ) {
      num++;

      return num;
    }
  }
}
/*__________________________________________

      Number of Visible Sublayers
__________________________________________*/
function numberOfVisibleSubLayers(layer) {
  num = 0;
  for ( var i =0; i<layer.layers.length; i++ ) {
    if ( layer.layers[i].visible ) {
        num++;

        return num;
      }
  }
}
/*__________________________________________

          Get X
__________________________________________*/
function getX(layer) {
  X = 0;

  for ( var i = 0; i < layer.pageItems.length; i++ ) {
    item = layer.pageItems[i];
    if ( !item.hidden ) {
      if ( item.position[0] < X ) {
        X = item.position[0];
      }
    }
  }

  for ( var i = 0; i < layer.layers.length; i++ ) {
    L = layer.layers[i];
    if ( L.visible ) {
      newX = getX(L);
      if ( newX < X ) {
        X = newX;
      }
    }
  }

  return Math.round(X);
}
/*__________________________________________

            Get Y
__________________________________________*/
function getY(layer) {
  Y = 0;
  for ( var i = 0; i < layer.pageItems.length; i++ ) {
    item = layer.pageItems[i];
    if ( !item.hidden ) {
      if ( item.position[1] < Y ) {
          Y = item.position[1];
      }
    }
  }

  for ( var i = 0; i < layer.layers.length; i++ ) {
    L = layer.layers[i];
    if ( L.visible ) {
      newY = getY(L);
      if ( newY < Y ) {
        Y = newY;
      }
    }
  }

  return Math.round(Y);
}
/*__________________________________________

            Get W
__________________________________________*/
function getW(layer) {
  W = 0;
  max = 0;
  for ( var i = 0; i < layer.pageItems.length; i++ ) {
    item = layer.pageItems[i];
    newMax = item.position[0]-dX+item.width;

    if ( !item.hidden ) {
      if ( newMax > max ) {
          max = newMax;
      }
    }
  }

  W = max - getX(layer);

  for ( var i = 0; i < layer.layers.length; i++ ) {
    L = layer.layers[i];
    if ( L.visible ) {
      newW = getW(L);
      if ( newW > W ) {
        W = newW;
      }
    }
  }

  return Math.round(W);
}

/*__________________________________________

        Get H
__________________________________________*/
function getH(layer) {
  H = 0;
  max = 0;

  for ( var i = 0; i < layer.pageItems.length; i++ ) {
    item = layer.pageItems[i];
    newMax = item.position[1]-dY;

    if ( !item.hidden ) {
      if ( newMax > max ) {
        max = newMax;
      }
    }
  }

  H = max - getY(layer);

  for ( var i = 0; i < layer.layers.length; i++ ) {
    L = layer.layers[i];
    if ( L.visible ) {
      newH = getH(L);
      if ( newH > H ) {
        H = newH;
      }
    }
  }

  return Math.round(H);
}

/*____________________________________

        Process Layer

Prints Names of all the sublayers
and the items on the layers
____________________________________*/
function processLayer(layer) {
  tabCount=tabCount+1;
  layerNum++;

  if ( layer.visible ) {
    //Visible Layer
    if (type == 'PathItem') {
      var type = addType(getX(layer),getY(layer));
      tab("\"type\":\"" + type  +"\",\n");
      tab("\"w\":\"" + getW(layer) +"\",\n");
      tab("\"h\":\"" + getH(layer)  +"\",\n");
      return;
    } else {
      //Print Page Items out as Children
      traversePageItems(layer);

      if ( numberOfVisiblePageItems(layer) > 0 ) {
        if ( numberOfVisibleSubLayers(layer) > 0 ) {
          tab(",\n");
        }
      }

      //Print Layers out as Children
      traverseLayers(layer);
    }

    tabCount = tabCount -1;
  }
  else {
    //Invisible Layer
    tabCount = tabCount -1;
  }

}

function addType(w,h) {
  for (var i in types) {
    if (types[i].w == w && types[i].h == h) return i;
  }
  types.push({id:types.length,w:w,h:h});
  return types.length-1;
}

/*____________________________________

      Traverse Children

  go through layers
____________________________________*/
function traverseLayers(parent) {
  if ( parent.layers.length > 0 ) {
    tabCount = tabCount + 1;

    for ( var ii = 0; ii < parent.layers.length; ii++ ) {
      //Open layer '{'
      child = parent.layers[ii];
      tab("tiles: [\n");

      processLayer(child);
      tab("],\n");
    }

    tabCount = tabCount - 1;
  }
}

/*_________________________________

      Parse Name
_________________________________*/
function parseName(child, i) {
  if ( child.name.length <= 0 ) {
    //Reset tag arrays so children won't inherit parent's values
    nameO[i] = "NONE";
    id[i] = "NONE";
    type[i] = child.typename;
    align[i] = "NONE";
    attach[i] = "NONE";
    variable[i] = "NONE";
  }
  else {
    childName = child.name.split(" ");
    var check = 0;
    var nameBox = [];

    for ( var ii = 0; ii < childName.length; ii++ ) {
      // loop through child name that was split into an array to pick out tags
      // Gather name
      if ( childName[ii].indexOf("$") === -1 &&
           childName[ii].indexOf("#") === -1 &&
           childName[ii].indexOf("@") === -1 &&
           childName[ii].indexOf("%") === -1 &&
           childName[ii].indexOf("&") === -1 ) {
        nameO[i] = childName[ii];
        check = 1;
      }
      else if ( check === 0 ) {
        nameO[i] = "NONE";
      }

      // Check for ID tag
      if ( childName[ii].indexOf("$") !== -1 ) {
        id[i] = childName[ii].toLowerCase().slice(1);
        id[i]=translateTag(id[i]);
      }
      else if ( ii === child.name.length ) {
        id[i] = "NONE";
      }

      // Check for type tag
      if ( childName[ii].indexOf("#") !== -1 ) {
        type[i] = childName[ii].toLowerCase().slice(1);
        type[i] = translateTag(type[i]);
      }
      else if (ii === childName.length) {
        type[i] = child.typename;
        type[i] = translateTag(type[i]);
      }

      // Check for align tag
      if ( childName[ii].indexOf("@") !== -1 ) {
        align[i] = childName[ii].toUpperCase().slice(1);
        align[i]=translateTag(align[i]);
      }
      else if ( ii === childName.length ) {
        align[i] = "NONE";
      }

      // Check for align tag
      if ( childName[ii].indexOf("%") !== -1 ) {
        attach[i] = childName[ii].toLowerCase().slice(1);
        attach[i]=translateTag(attach[i]);
      }
      else if ( ii === childName.length ) {
        attach[i] = "NONE";
      }

      // Check for variable tag
      if ( childName[ii].indexOf("&") !== -1 ) {
        variable[i] = childName[ii].toLowerCase().slice(1);
        variable[i]=translateTag(variable[i]);
      }
      else if ( ii === childName.length ) {
        variable[i] = "NONE";
      }
    }
  }

  // Check if element is Placed Item
  if ( child.typename === "PlacedItem" ) {
    nameO[i] = "No Linked PlacedItem";
  }

  // Check if element is Path Item
  // then add color information
  if ( child.typename === "PathItem" ) {
    fillColor[i] = child.fillColor;
    strokeColor[i] = child.strokeColor;
  }

  // Check if element is TextFrame
  // then add font information
  if ( child.typename === "TextFrame" ) {
    fontFamily[i] = child.textRange.characterAttributes.textFont.family;
    fontStyle[i] = child.textRange.characterAttributes.textFont.style;
    fontSize[i] = child.textRange.characterAttributes.size;
    fontJustification[i] = child.textRange.paragraphAttributes.justification;
    tracking[i] = child.textRange.characterAttributes.tracking;
    fontFillColor[i] = child.textRange.characterAttributes.fillColor;
    fontStrokeColor[i] = child.textRange.characterAttributes.strokeColor;
    fontStrokeWeight[i] = child.textRange.characterAttributes.strokeWeight;
    leading[i] = child.textRange.characterAttributes.leading;
    textContent[i] = child.textRange.contents;
  }
}
/*_________________________________

      Process Page Item
_________________________________*/
function processPageItem(child, i) {
  var cX = child.position[0];
  var cY = child.position[1];

  var X  = Math.round(cX - dX);
  var Y  = Math.round((cY - dY)- child.height);
  var W = Math.round(child.width);
  var H  = Math.round(child.height);
  parseName(child, i);

  tab("\"id\":" + parseInt(nameO[i]) + ",\n");
  // Output color information for PathItems
  if ( child.typename === "PathItem" ) {
    //Type
    var type = addType(W,H);
    tab("\"type\":" + type  +",\n");
    tab("\"x\":" + X + ",\n");
    tab("\"y\":" + Y  + ",\n");
    
    // Fill Colors
    if ( fillColor[i].typename === "RGBColor" ) {
      var r = fillColor[i].red.toString(16);
      if (r.length == 1) r = "0" + r;
      var g = fillColor[i].green.toString(16);
      if (g.length == 1) g = "0" + g;
      var b = fillColor[i].blue.toString(16);
      if (b.length == 1) b = "0" + b;
    }
  }
}

function outputTypes() {
  output = "var layout = {\n" + output;
  tabCount++;
  tab("types:" + type  +" [\n");
  tabCount++;
  for (var i in types) {
    tab("{\n");
    tabCount++;
    tab("\"id\":" + types[i].id  +",\n");
    tab("\"w\":" + types[i].w  +",\n");
    tab("\"h\":" + types[i].h  +",\n");
    tabCount--;
    tab("},\n");
  }
  tabCount--;
  tab("]\n");
  tabCount--;
  tab("};\n");
}
/*____________________________________

      traverse Page Items
____________________________________*/
function traversePageItems(layer) {
  tabCount=tabCount+1;
  layerNum++;
  var offset; //switch between names with and without #types, set to 1 or 0

  for ( var i = 0; i < layer.pageItems.length; i++ ) {
    child = layer.pageItems[i];
    if ( !child.hidden ) {
      tab("{\n");
      tabCount++;

      processPageItem(child), i;

      tabCount-=1;
      if ( i === layer.pageItems.length - 1 ) {
        tab("}\n");
      }
      else {
        tab("},\n");
      }
    }
  }
  tabCount = tabCount - 1;
}

/*_________________________

    Write File
_________________________*/
function writeFile(info) {
  try {
    var f = new File(FPath + "/layout.js");
    f.open('w');
    f.lineFeed = fileLineFeed;
    f.write(info);
    f.close();
  }
  catch(e){}
}

// Ask the user for the folder to export to
//var FPath = Folder.selectDialog("Save exported coordinates to") ;

//save to current path ../js
var thisFile = new File($.fileName);
var FPath = thisFile.path + '/../js';

//-------------------------------------------------------------------------------------------
// Detect line feed type
if ( $.os.search(/windows/i) !== -1 ) {
  fileLineFeed = "Windows";
}
else {
  fileLineFeed = "Macintosh";
}

// Run the functions
processDocument(document);
outputTypes();
writeFile(output);

// Export document PNG
//var docPng = new File(FPath.fsName+"/"+documentName+".png");
//document.exportFile(docPng, ExportType.PNG24);
//pngNum++;

// Show results
if ( FPath === null ) {
  alert ("Export aborted", "Canceled");
}
else {
  alert( "Exported layout to " +
        translateTag(FPath),
  "Success!");
}

