var gridSizex=1.2,gridSizey=1.6,maxX=10,maxY=10,boxheight=1.4,boxwidth=1,jitterX=0,jitterY=0,colors=[14755101,3909315],glCards=[],glCards2=[],camXExtents=-2,camYExtents=-2,camZ1Extents=-4.3,camZ2Extents=6.5,camRotateMin=0,camRotateMax=.9,camZStart=15,camZEnd=5,camZAnimationTime=2,camPanToCityAnimationTime=1,camPanAnimationTime=.01,camMinHeight,camMinX,cambuildingsPerRow,camMinY,cambuildingsPerColumn,originX,originY,isMobile=/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent),isiOS=/iPhone|iPad|iPod/i.test(navigator.userAgent),mUP=!1,mDOWN=!1,mRIGHT=!1,mLEFT=!1,mGOIN=!1,mGOOUT=!1,mROTUP=!1,mROTDOWN=!1,oldTouchX=0,oldTouchY=0,xMove=0,yMove=0,mTouchDown=!1,mTouchMove=!1,overlay=!1,oldScale=0,pinched=!1,canvas,acc_oldaz=null,acc_az=0,acc_arAlpha=0,acc_arBeta=0,acc_speed=5,acc_fromx=null,acc_tox=null,acc_fromy=null,acc_toy=null,acc_totilt=null,acc_fromtilt=null;