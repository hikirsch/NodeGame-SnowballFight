<?php
/**
File:
	defs.js
Created By:
	Mario Gonzalez
Project	:
	Ogilvy Holiday Card 2010
Abstract:
Basic Usage:
*/
	require_once('class.rc4crypt.php');
	function encrypt($string)	//encrypts a string with RC4 encryption and returns it.
	{
		$key = "d0ntw0rryab0utit";

		$encoded = base64_encode($string);
		$encrypted = rc4crypt::encrypt($key, $encoded);

		return bin2hex($encrypted);
	}

	function decrypt($stirng)
	{
		$weekiwaawoo = "d0ntw0rryab0utit";
		$source = pack("H*", $string);
		$decrypted = rc4crypt::decrypt($weekiwaawoo, $source);

		return $decrypted;
	}

 	function splitOnly($string)
	{

	}
	function decryptAndSplit($string)	//decrypts a query string, splits it into an associate array and returns it.
	{
		$weekiwaawoo = "d0ntw0rryab0utit";
		$source = pack("H*", $string);

		$decrypted = rc4crypt::decrypt($weekiwaawoo, $source);
		parse_str($decrypted, $valueArray);
		return $valueArray;

		$testString = substr($decoded, 0, strrpos($decoded, "&"));
		//check that the dataString is legimate
		if($valueArray["nonce"] == md5($testString)) {
			//the data string has not been tampered with
			return $valueArray;
		} else {
			//the data string has failed the integrity check, abort
			output('<result success="false" error="INVALID" />', true);
		}
	}


	function output($string, $clear = false)	//Encrypts a string (unless clear=true) and outputs to the browser.
	{
		if($clear)
			$returnString = $string;
		else
			$returnString = encrypt($string);

		echo $returnString;
	}
?>
 
