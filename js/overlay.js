$(function() {
	$('#people-list li').mouseenter( function() {
		$(this).children('img.cover').addClass('hovered');
	}).mouseleave( function() {
		$(this).children('img.cover').removeClass('hovered');
	});
});