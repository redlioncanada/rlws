<?php

header("Content-type: image/png");
$string = $_GET['text'];
$im     = imagecreatefrompng("img/btn1.png");
$orange = imagecolorallocate($im, 255, 255, 255);
$px     = (imagesx($im) - 7.5 * strlen($string)) / 2;
imagestring($im, 3, $px, 9, $string, $orange);
imagepng($im);
imagedestroy($im);

?>