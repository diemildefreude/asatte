<?php
$ch = curl_init('https://forum.melonland.net/mAuth.php?mode=external');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
    'client_key' => bin2hex(random_bytes(32)),
    'domain' => '127.0.0.1:8000',
    'return_path' => 'http://127.0.0.1:8000/auth/melonland/callback'
]));
$res = curl_exec($ch);
echo "Result with 127.0.0.1:8000 -> " . $res . "\n";

$ch2 = curl_init('https://forum.melonland.net/mAuth.php?mode=external');
curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch2, CURLOPT_POSTFIELDS, http_build_query([
    'client_key' => bin2hex(random_bytes(32)),
    'domain' => '127.0.0.1',
    'return_path' => 'http://127.0.0.1:8000/auth/melonland/callback'
]));
$res2 = curl_exec($ch2);
echo "Result with 127.0.0.1 -> " . $res2 . "\n";

$ch3 = curl_init('https://forum.melonland.net/mAuth.php?mode=external');
curl_setopt($ch3, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch3, CURLOPT_POSTFIELDS, http_build_query([
    'client_key' => bin2hex(random_bytes(32)),
    'domain' => 'localhost',
    'return_path' => 'http://localhost/callback'
]));
$res3 = curl_exec($ch3);
echo "Result with localhost -> " . $res3 . "\n";
