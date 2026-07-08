<?php
namespace MelonLand;

// HTTP Stopper - do not load this file directly in browsers
if (basename(__FILE__) == basename($_SERVER['SCRIPT_FILENAME']))
{
	header('HTTP/1.0 404 Not Found');
	exit;
}


// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// MelonLand API Helper (mAuth + Forum API) 2026 - melonland.net
// 		 Version 1.2
// Greetings, this is the helper file for MelonLand's Passport System and Forum API.
// It allows you to authenticate members and access public forum data!
//
// How to Setup:
// Place this file in the root of your PHP project, then require it:
// 		 require_once 'melonland-api.php';
//
// How to get member info:
//     $member = MelonLand\getMemberInfo();
//
//     if ($member->authenticated)
//         echo 'Hello, ' . $member->displayname . '!';
//     else
//         echo '<a href="' . $member->connect_url . '">Show MelonLand Passport!</a>';
//
// Request extra member data:
//     $member = MelonLand\getMemberInfo(['email', 'website']);
//
// NOTE: Member data approvals are persistent untill the member logs out, they then reset!
//
// How to use actions: 
// Actions let you run operations on the melonland server.
// a complete list of actions can be found on the wiki page.
//
//     $url = MelonLand\buildActionURL('credit_transfer', 
//										['to' => SOMEONES-MEMBER-ID, 'amount' => 10],
//										'/thankyou.html');
//     echo '<a href="' . $url . '">Send Credits</a>';
//
//
//
//
// Thats everything! If you need support please check:
// 		Forum Thread:  https://forum.melonland.net/index.php?topic=5453
// 		Wiki Page:     https://wiki.melonland.net/auth

// ++++++++ Config (you prob dont want to touch these) ++++
define("MELONLAND_AUTH_API",   "https://forum.melonland.net/mAuth.php"); // Auth Server URL
define("MELONLAND_FORUM_API", "https://forum.melonland.net/api.php");  // Forum API URL
define("MELONLAND_AUTH_CACHE_TIME", 30); // Seconds before cache refreshing
define("MELONLAND_API_CACHE_TIME", 60); // Seconds before cache refreshing
define('APCU_INSTALLED', function_exists('apcu_fetch')); // Check if the APCu mod is installed


// ++++++++ Main Connection Function ++++
// Fetches member data from the melonland server or local cache.
//
// Will always return an "authenticated" bool, plus details
//
// If authenticated = true
//		returns member id, displayname, accountname
// 		   and any extra fields you requested if they exist
//
// If authenticated = false
// 		returns connect_url - ALERT: this is where you should send members to authenticate
// 			and reason + reasonMessage for debugging
//
// $extraData - a string array of extra requested fields ['credits']
// $returnPath - the page to the member will be returned to after approving the passport request '/logged-in.php'
//
function getMemberInfo($extraData = [], $returnPath = null)
{
    $appOrigin = url_origin($_SERVER, true);
    $clientKey = getOrMakeClientKey($appOrigin['isSSL']);
    $returnPath = $returnPath ?? $_SERVER['REQUEST_URI'];

    // Check cache
    if (APCU_INSTALLED) {
        $cacheKey = "melonland_auth_" . hash("sha256", $clientKey . MELONLAND_AUTH_API . implode(',', $extraData));
        $cachedMemberData = apcu_fetch($cacheKey);
        if ($cachedMemberData) {
            return $cachedMemberData;
        }
    }

    // Download member data
    $rawMemberData = downloadMemberData($clientKey, $appOrigin['domain'], $extraData, $returnPath);
    $memberData = processMemberData($rawMemberData);

    // Only cache authenticated results
    if (APCU_INSTALLED) {
        if ($memberData->authenticated) {
            apcu_store($cacheKey, $memberData, MELONLAND_AUTH_CACHE_TIME);
        }
    }

    return $memberData;
}

// ++++++++ Action URL Builder ++++
// Takes an action name, plus an array of data, plus an optional return path.
// Returns a formatted url for use in HREF links or GET forms
//
// $action - a string of the requested action 'credit_transfer'
// $extraData - a string array of extra requested fields ['credits']
// $returnPath - the page to the member will be returned to after approving the passport request '/logged-in.php'
//
function buildActionURL($action, $actionData = [], $returnPath = null)
{
    $appOrigin = url_origin($_SERVER, true);
    $returnPath = $returnPath ?? $_SERVER['REQUEST_URI'];

    return MELONLAND_AUTH_API
        . '?mode=action'
        . '&domain='      . urlencode($appOrigin['domain'])
        . '&return='      . urlencode($returnPath)
        . '&action_type=' . urlencode($action)
        . '&action_data=' . urlencode(json_encode($actionData));
}




// +API+API+API+API+API+API+API+   MelonLand API    +API+API+API+API+API+API+API+
//
// The forum has its own API that is seprate from the auth system, you can use this to
// gather publicly accessable data, such a member lists, profile fields, websites etc.
//
// NOTE: The API is cached and data you recive may be upto 60 seconds out of date!
//
// How to use: $website = MelonLand\getMemberWebsite(1);
// Returns:
//	[0][member_id, url, title, surfclub = true/false (are they surfclub verified)]
function getMemberWebsite($memberId)
{
    $website = accessMelonLandAPI('memberWebsites', ['id' => $memberId]);
    if (!$website || !$website->ok) return null;
    return $website->results[0];
}

// Member Name: API access wrapper, takes a member id, and returns their display name
//
// How to use: $name = MelonLand\getMemberDisplayName(1);
// Returns:
//	[0][value = Melooon] 
function getMemberDisplayName($memberId)
{
    $name = accessMelonLandAPI('memberWebsites', ['id' => $memberId]);
    if (!$name || !$name->ok) return null;
    return $name->results[0]->value;
}

// ++++++++ General API Helper ++++
// This is a helper function for making requests to the API, it takes a functionName
// plus params for the function in an array (as seen above)
//
// A list of valid API functionNanes and params can be found on the wiki:
//		https://wiki.melonland.net/api
//
// $params is a an object array ['id' => 1]
//
// How to use:
//     $data = MelonLand\accessMelonLandAPI('memberNames');
//     foreach ($data->results as $member) {
//         echo $member->value;
//     }
//
function accessMelonLandAPI($functionName, $params = [])
{
    $params[$functionName] = '';
    $url = MELONLAND_FORUM_API . '?' . http_build_query($params);

    if (APCU_INSTALLED) {
        $cacheKey = 'melonland_forum_api_' . hash('sha256', $url);
        $cachedResponse = apcu_fetch($cacheKey);
        if ($cachedResponse)
        	return $cachedResponse;
    }

    $curlSession = curl_init($url);
    curl_setopt_array($curlSession, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 4,
    ]);
    $responseBody = curl_exec($curlSession);
    $responseErrors  = curl_error($curlSession);
    curl_close($curlSession);

    if ($responseErrors || !$responseBody) 
    	return null; // api is possibly offline or unreachable

    $jsonBody = json_decode($responseBody);
    if (!is_object($jsonBody)) 
    	return null;

    if (APCU_INSTALLED && $jsonBody->ok) {
        apcu_store($cacheKey, $jsonBody, MELONLAND_API_CACHE_TIME);
    }

    return $jsonBody;
}






// ALERT ALERT ALERT - You will not need to access anything below here! ALERT ALERT ALERT
// ALERT ALERT ALERT - You will not need to access anything below here! ALERT ALERT ALERT
// ALERT ALERT ALERT - You will not need to access anything below here! ALERT ALERT ALERT
// ALERT ALERT ALERT - You will not need to access anything below here! ALERT ALERT ALERT
// ALERT ALERT ALERT - You will not need to access anything below here! ALERT ALERT ALERT
// ALERT ALERT ALERT - You will not need to access anything below here! ALERT ALERT ALERT
// ALERT ALERT ALERT - You will not need to access anything below here! ALERT ALERT ALERT







// ++++++++ HELPERS ++++

// Get or create the local identity cookie to identify members
function getOrMakeClientKey($isSSL)
{
    $cookieName = "melonland_auth_client_key";

    // Cookie already exists
    if (!empty($_COOKIE[$cookieName])) {
        return $_COOKIE[$cookieName];
    }

    // No cookie — create one
    $newClientKey = bin2hex(random_bytes(32));
    setcookie($cookieName, $newClientKey, [
        "expires"  => time() + 365 * 24 * 60 * 60 * 10, // 10 years
        "path" => "/",
        "secure" => $isSSL,
        "httponly" => true,
        "samesite" => "Lax",
    ]);
    $_COOKIE[$cookieName] = $newClientKey;

    return $newClientKey;
}

// Downloads member data from the melonland auth server
function downloadMemberData($clientKey, $appOrigin, $extraData, $returnPath)
{
    // Build POST fields
    $postData = [
        "client_key" => $clientKey,
        "domain" => $appOrigin,
        "return_path" => $returnPath,
    ];
    if (!empty($extraData)) {
        $postData["extra_data"] = implode(',', $extraData);
    }

    $postFields  = http_build_query($postData);
    $curlSession = curl_init(MELONLAND_AUTH_API . "?mode=external");
    curl_setopt_array($curlSession, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $postFields,
        CURLOPT_TIMEOUT => 4,
        CURLOPT_HTTPHEADER => ["Content-Type: application/x-www-form-urlencoded"],
    ]);

    // LAUNCH - good luck auth api request! o>
    $responseBody   = curl_exec($curlSession);
    $responseErrors = curl_error($curlSession);
    curl_close($curlSession);

    if ($responseErrors || !$responseBody) {
        return null; // melonland may be offline :O
    }

    $jsonBody = json_decode($responseBody);

    return is_object($jsonBody) ? $jsonBody : null;
}

// Convert mAuth server response into a standard object
function processMemberData($rawMemberData)
{
    // No data - melonland may be offline/faulty
    if (!$rawMemberData) {
        return (object) [
            "authenticated" => false,
            "connect_url"   => null,
            "reason"        => "server_error",
            "reasonMessage" => "Could not connect to MelonLand Auth.",
        ];
    }

    // Not authenticated — return connect_url for the passport link
    if (!$rawMemberData->authenticated) {
        return (object) [
            "authenticated" => false,
            "connect_url"   => $rawMemberData->connect_url   ?? null,
            "reason"        => $rawMemberData->reason        ?? "unknown",
            "reasonMessage" => $rawMemberData->reasonMessage ?? null,
        ];
    }
    
    // Authenticated but no member data?? - this should never happen
    if (!$rawMemberData->member) {
        return (object) [
            "authenticated" => false,
            "connect_url"   => null,
            "reason"        => "server_error",
            "reasonMessage" => "There server failed to return member data, try again.",
        ];
    }

    // Authenticated — collect member values from response
    $result = ["authenticated" => true];
    foreach ($rawMemberData->member as $row => $value) {
        $result[$row] = $value;
    }

    return (object) $result;
}

// GET FULL URL - https://stackoverflow.com/questions/6768793/get-the-full-url-in-php/8891890#8891890
function url_origin($s, $use_forwarded_host = false)
{
    $ssl      = (isset($s["HTTPS"]) && $s['HTTPS'] !== 'off');
    $sp       = strtolower($s['SERVER_PROTOCOL']);
    $protocol = substr($sp, 0, strpos($sp, '/')) . ($ssl ? 's' : '');
    $port     = $s['SERVER_PORT'];
    $port     = ((!$ssl && $port == '80') || ($ssl && $port == '443')) ? '' : ':' . $port;
    $host     = ($use_forwarded_host && isset($s['HTTP_X_FORWARDED_HOST'])) ? $s['HTTP_X_FORWARDED_HOST'] : (isset($s['HTTP_HOST']) ? $s['HTTP_HOST'] : null);
    $host     = isset($host) ? $host : $s['SERVER_NAME'] . $port;
    return ["origin" => $protocol . '://' . $host, "domain" => $host, "isSSL" => $ssl];
}
