<?php
$client_key = bin2hex(random_bytes(32));
$ch = curl_init('https://forum.melonland.net/mAuth.php?mode=external');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
    'client_key' => $client_key,
    'domain' => '127.0.0.1:8000',
    'return_path' => '/auth/melonland/callback'
]));
$res = curl_exec($ch);
echo "Call 1: " . $res . "\n";

$res2 = curl_exec($ch);
echo "Call 2: " . $res2 . "\n";
