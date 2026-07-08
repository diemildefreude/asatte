<?php
// DEMO FILE FOR MELONLAND PASSPORTS AND API
// Hello! If you're readiing this you know how to read!
//
// Wiki for API:		https://wiki.melonland.net/api
// Wiki for mAuth: 	https://wiki.melonland.net/auth
//
// Help & Questions Thread: https://forum.melonland.net/index.php?topic=5453

// You must inclide this file to gain access to MelonLand functions!
require_once 'melonland-api.php';

// + This is the entire authentication system! + 
// We $member is populated if the passport has already been approved
// This request is also asking for "credits" and an optional extra
$member = MelonLand\getMemberInfo(['credits']);

?>

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
      <title>You are entering Melonland</title>
			<style>
				body {
					padding: 60px;
					background-color: yellow;
				}
				
				hr {
					margin: 25px 0px;
				}
				
				#logged_in,
				#logged_out {
					margin: 10px;
					padding: 20px;
				}
				#logged_in {
					background-color: lime;
				}
				#logged_out {
					background-color: lightgrey;
				}
			</style>
    </head>
  <body>
  
    <h1>MelonLand API Demo v1.0</h1>
    <p>Greetings chum, this is a demo file for the MelonLand Passport Auth &amp; API!</p>
    
    <!-- Example of a simple login system! -->
    <!-- Checks for logged in member, then pulls member data - ALERT this data is cached for 60 seconds! -->
    <h2>Login Area!</h2>
    <?php if ($member->authenticated): ?>
    	<div id="logged_in">
    		<p>
    			You are logged in as <b><?= $member->displayname ?></b> :^]
    			<br>
    			You have <b><?= $member->credits ?></b> Swap Credits!
    		</p>
    		
    		<br>
    		
    		<!-- This is a demo of a credit transfer Action command -->
    		<!-- This function outputs a Hyper Action url that can be linked -->
    		Send Melon a 1 credit tip? <a href="<?php echo MelonLand\buildActionURL('credit_transfer', ['to' => 1, 'amount' => 1]); ?>">Send Credits</a>!
    	</div>
    <?php else: ?>
    	<div id="logged_out">
    		<p>
    			<!-- When you are asking people to login PLEASE make it clear you are using MelonLand Passports -->
    			You are logged out! <a href="<?= $member->connect_url ?>">Login with MelonLand Passport</a>!
    		</p>
    	</div>
    <?php endif ?>
    
    <hr />
    
    <!-- Example of a Public API requests -->
    <h2>Website Lookup!</h2>
    <p>Enter a MelonLand member ID number to check if they have a website!</p>
    <form>
    	<input type="number" name="website_search" value="<?php echo (isset($_GET['website_search']) ? $_GET['website_search'] : "1") ?>" />
    	<input type="submit" value="Check!" />
    </form>
    <p>
	    <?php
	    	if (isset($_GET['website_search']))
	    	{
	    		// This is a helper function to make fetching websites easier! It offers, url, title and surclfub values!
	    		$website = MelonLand\getMemberWebsite($_GET['website_search']);
	    		if($website != null) 
	    		{
	    			echo 'That member\'s website is: <a href="' . $website->url . '">' . $website->title . '</a>';
	    			if($website->surfclub)
	    			{
	    				echo ' (SurfClub Verified)';
	    			}
	    		}
	    		else 
	    		{
		    		echo 'That member does not have a website!';
		    	}
		    			
	    	}
	    ?>
    </p>
    
    <hr />
    
    <!-- Example of a full API call! -->
    <h2>Guilds in The Frozen Lake</h2>
    <ul>
    	<?php
    		// Request API function "guilds" with paramiter region id = 4 (Frozen Lake)
    		$result = MelonLand\accessMelonLandAPI('guilds', ['region' => 3]);
    		if($result->ok) 
    		{
    			// We have a result! lets print our guilds!
    			$guilds = $result->results;
	    		foreach ($guilds as $guild) 
	    		{
	    		    echo '<li>' . $guild->name . '</li>';
	    		}
	    	}
	    	else 
	    	{
	    		// its good to assume the api wont ALWAYS be online!
			  	echo '<li>Could not connect to MelonLand API</li>';
			  }
    	?>
    </ul>
    
  </body>
</html>
<!-- Its easy right!?!?! -->
