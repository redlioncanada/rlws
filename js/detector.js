/**
 * @author alteredq / http://alteredqualia.com/
 * @author mr.doob / http://mrdoob.com/
 */

var Detector = {

	canvas: !! window.CanvasRenderingContext2D,
	webgl: ( function () { try { var canvas = document.createElement( 'canvas' ); return !! ( window.WebGLRenderingContext && ( canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) ) ); } catch( e ) { return false; } } )(),
	workers: !! window.Worker,
	fileapi: window.File && window.FileReader && window.FileList && window.Blob,

	getWebGLErrorMessage: function () {

		var element = document.createElement( 'div' );
		element.id = 'webgl-error-message';
		element.style.fontFamily = 'fira-sans, sans-serif';
		element.style.fontSize = '14px';
		element.style.fontWeight = 'normal';
		element.style.textAlign = 'center';
		element.style.color = '#e32526';
		element.style.padding = '1.5em';
		element.style.width = '400px';
		element.style.margin = '0 auto';
		element.style.paddingTop = '37%';
		element.style.opacity = '0';
		element.style.display = 'none';

			element.innerHTML = window.WebGLRenderingContext ? [
				'Oops. Seems like you\'re trapped in the past.<br> To properly enjoy our site, we recommend using the latest versions of <a href="http://www.google.com/chrome/">Google Chrome</a> or <a href="http://www.mozilla.com/firefox/">Firefox</a><br>(and joining us in the present).'
			].join( '\n' ) : [
				'Oops. Seems like you\'re trapped in the past.<br> To properly enjoy our site, we recommend using the latest versions of <a href="http://www.google.com/chrome/">Google Chrome</a> or <a href="http://www.mozilla.com/firefox/">Firefox</a><br>(and joining us in the present).'
			].join( '\n' );


		return element;

	},

	addGetWebGLMessage: function ( parameters ) {
		var parent, id, element;

		parameters = parameters || {};

		parent = parameters.parent !== undefined ? parameters.parent : document.body;
		id = parameters.id !== undefined ? parameters.id : 'dinosaur';

		element = Detector.getWebGLErrorMessage();
		element.id = id;

		$(parent).append( element );
		$('#canvas').css('display','none');
		return element;

	}

};

// browserify support
if ( typeof module === 'object' ) {

	module.exports = Detector;

}