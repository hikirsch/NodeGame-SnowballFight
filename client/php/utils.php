<?php
/**
File:
	defs.js
Created By:
	Mario Gonzalez
Project	:
	Ogilvy Holiday Card 2010
Abstract:
 	Contains different functions for managing users.
 	Be sure that the variable, action must be supplied, otherwise it will output an error.
Basic Usage:
	NOTES:
	* To test manually in the address bar pass this in as GET
 		EXAMPLE: http://localhost:8889/GIT/SnowballFight-Oneday/client/php/utils.php?debug=true&enc=|action=sendEmail|toName=oneday|toEmail=mariogonzalez@gmail.com|fromName=mario|fromEmail=onedayitwillmake.com|message=hi-there'
*/
	include 'defs.php';

	//Turn the encrypted query into a string,
	//Turn that string into aturn it into an array with all our info
	if ($_GET['debug'] == '' ||$_GET['debug'] == 'false')
		$info = decryptAndSplit($_POST['enc']);  //it  comes from post, or is not debug - deccrypt it - then spit
	else
		parse_str(str_replace("|", "&",$_GET['enc']), $info);//comes from get, or debug is true, just split it, its not encrypted

	// Explicitely find the action and pass the info
	Switch ($info['action'])
	{
		case 'sendEmail':
			sendMail($info);
		break;
		default:
		break;
	}

	function sendMail($inf)
	{
		echo "Hello";
			$databaseName = "`lola`.`lola_users_uk`";
		if(strpos($_SERVER["SERVER_NAME"], "co.uk") == false)
			$baseLink = "http://www.lolamarcjacobs.com";
		else
			$baseLink = "http://www.lolamarcjacobs.co.uk";

		$t_name		= $inf['toName'];
		$t_email	= $inf['toEmail'];
		$f_name		= $inf['fromName'];
		$f_email	= $inf['fromEmail'];
		$message	= $inf['message'];
		$base_url	= "http://google.com";
		$subject	= "$f_name wants you to check out the new Holiday Snowball Fight!";

		$body	= <<<HTML
		<!doctype html>
<html>
	<head>
		<title>Ogilvy Holiday 2010 - Node Snowball</title>
		<meta http-equiv="pragma" content="no-cache">
		<meta http-equiv="expires" content="-1">
	</head>
	<body>
	<div id="email">
	Hi there, {$t_name},<br><br>

	Your friend <b>{$f_name}</b>, wants you to check out<br>
	Holiday Snowball Fight, at {$base_url}:<br>
	<b>{$message}</b><br>

	<img src="http://holiday2010.stage.ogilvy.com/client/img/character-select/big-yeti.png" />
	<br><br><br>Have fun and stuff!
	</div>
	</body>
</html>
HTML;

		$headers = "Content-Type: text/html; charset=iso-8859-1\n";
		$headers .= "From: Ogilvy Holiday Card Team <$f_email>\r\n";
		mail($t_email, $subject, $body, $headers);

		echo "<result success='true' />";
		echo "<![CDATA[";
		var_dump($inf);
		echo "]]>";
		echo "</result>";
	}



?>