<?php
	$socket = fsockopen("127.0.0.1", 8080);
	if(!$socket)
		echo "Problem with OpenJabNab !";
	else
	{
		// Types :
		// 1 = GET
		// 2 = Normal POST
		// 3 = Raw POST
    
    // php7 replaced HTTP_RAW_POST_DATA with file_get_contents("php://input")
    $postdata = file_get_contents("php://input")
		//if(isset($GLOBALS['HTTP_RAW_POST_DATA']))
    if(isset($postdata))
			$type = 3;
		else if (count($_POST))
			$type = 2;
		else
			$type = 1;
		// Headers :
		$headers = "";
		foreach($_SERVER as $key => $value)
		{
			if(strncmp($key, "HTTP_", 5) == 0)
			{
				$header_key = substr($key, 5);
				$header_key = str_replace("_", "-", $header_key);
				$headers .= $header_key . ": " . $value . "\r\n";
			}
      // header is now one key value per text line
		}
		switch($type)
		{
			case 1: // GET
				$requestdata = $headers . "\x00" . str_replace("+", " ", $_SERVER['REQUEST_URI']);
				break;
			case 2: // POST
				if(isset($_SERVER["CONTENT_TYPE"]))
					$headers .= "Content-Type: " . $_SERVER["CONTENT_TYPE"] . "\r\n";
				if(isset($_SERVER["CONTENT_LENGTH"]))
					$headers .= "Content-Length: " . $_SERVER["CONTENT_LENGTH"] . "\r\n";
				$postdata_array = array();
				foreach($_POST as $key => $value)
						$postdata_array[] = urlencode($key) . "=" . urlencode($value);
				$requestdata = $headers . "\x00" . $_SERVER['REQUEST_URI'] . "\x00" . implode($postdata_array, "&");
				break;
			case 3: // Raw Post
				if(isset($_SERVER["CONTENT_LENGTH"]))
					$headers .= "Content-Length: " . $_SERVER["CONTENT_LENGTH"] . "\r\n";
				$requestdata = $headers . "\x00" . $_SERVER['REQUEST_URI'] . "\x00" . $GLOBALS['HTTP_RAW_POST_DATA'];
				break;
		}
    // +5 for lenght(4) and type (1)
		$requestlen = 5 + strlen($requestdata);
    // join all into a buffer 
    // L for unsigned 32bit
    // C for unsigned char
    // a for null padded string
		$request = pack("LCa*", $requestlen, $type, $requestdata);
    // write socket to openjab nab server
		fwrite($socket, $request);
		while (!feof($socket)) 
			echo fgets($socket, 128);

		fclose($socket);
	}
?>
