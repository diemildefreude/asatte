<?php
$ch3 = curl_init('https://forum.melonland.net/mAuth.php?mode=external');
curl_setopt($ch3, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch3, CURLOPT_POSTFIELDS, http_build_query([
    'client_key' => bin2hex(random_bytes(32)),
    'domain' => '127.0.0.1',
    'return_path' => 'http://127.0.0.1/callback'
]));
$res3 = curl_exec($ch3);
echo $res3 . "\n";
