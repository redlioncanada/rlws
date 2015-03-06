<?php
$url = "http://redlioncanada.com/api/content/".intval($_GET['id']);
$ch = curl_init();
curl_setopt($ch,CURLOPT_URL,$url);
curl_setopt($ch,CURLOPT_RETURNTRANSFER,1);
curl_setopt($ch,CURLOPT_CONNECTTIMEOUT, 4);
$json = curl_exec($ch);
if(!$json) error_log(curl_error($ch));
curl_close($ch);
$data = json_decode($json);