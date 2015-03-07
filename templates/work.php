<?php require 'fetchdata.php'; ?>
<div id="work-overlay">
	<header>
		<button class="close">&nbsp;</button>
		<h2><?=$data->title?></h2>
		<h1><?=$data->description?></h1>
		<div class="social-btns">
			<img src="img/twitter.png" alt="Twitter">
			<img src="img/gplus.png" alt="Google Plus">
			<img src="img/facebook.png" alt="Facebook">
			<img src="img/linkedin.png" alt="LinkedIn">
		</div>
	</header>
	
	<div id="description">
		<p><?=$data->long_description?></p>
		<div class="datecat">
			<?=date("F Y", strtotime($data->launch_date))?><br><?=$data->tags?>
		</div>
	</div>
	
	<?=$data->content?>
</div>