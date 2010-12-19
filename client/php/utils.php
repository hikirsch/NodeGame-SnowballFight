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
 		EXAMPLE: http://localhost:8889/GIT/SnowballFight-Oneday/client/php/utils.php?debug=true&enc=|action=sendEmail|toName=oneday|toEmail=mariogonzalez@gmail.com|fromName=mario'
*/
	include 'defs.php';

	//Turn the encrypted query into a string,
	//Turn that string into aturn it into an array with all our info
	//if ($_GET['debug'] == '' ||$_GET['debug'] == 'false')
	//{
	parse_str(str_replace("|", "&", $_POST['enc']), $info);  //it  comes from post, or is not debug - deccrypt it - then spit
	//}
//	else
//	{
		//	parse_str(str_replace("|", "&",$_GET['enc']), $info);//comes from get, or debug is true, just split it, its not encrypted
//	}

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
		$t_email	= $inf['toEmail'];
		$gameID     = $inf['game'];
		$f_name		= 'Ogilvy & Mather Holiday Card 2010';
		$f_email	= 'holiday2010@ogilvy.com';
		$playerName = $inf['fromName'];
		$subject	= "$playerName wants you to check out the new Holiday Snowball Fight!";

		$body = implode( file("emails/omg_invite_external.html") );
		$body = str_replace( "{{GAME_ID}}", $gameID, $body);

		$headers = "Content-Type: text/html; charset=iso-8859-1\n";
		$headers .= "From: $f_name <$f_email>\r\n";

		mail($t_email, $subject, $body, $headers);

		echo "true";
	}
?>