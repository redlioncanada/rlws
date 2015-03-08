<html ng-app="myApp">
	<head>
		<title>Red Lion {REDEFINE}</title>
		<link rel="stylesheet" href="../css/style.css?v=1.0">
	</head>
	<body ng-controller="CardTestController">
		<header>
			<a href="#" id="launchAbout">culture<br>careers<br>contact</a>
			<img id="logo" src="img/rl.gif" />
			<form>
				<input type="text" name="searchterm" id="searchTerm">
				<input type="text" id="cachedTerm">
				<input type="submit" style="display:none;" name="submit">
				<img id="searchCancel" src="img/close-btn-grey.png"/>
			</form>
		</header>
		<div id="controls"></div>
		<div id="blackout">
			<div id="overlay">
				<div id="people-overlay">
					
				</div>
			</div>
		</div>
		<script src="//use.typekit.net/ngi3tcl.js"></script>
		<script>try{Typekit.load();}catch(e){}</script>
	</body>
</html>