<?php
$ch = curl_init('https://forum.melonland.net/mAuth.php?mode=external');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
    'client_key' => bin2hex(random_bytes(32)),
    'domain' => 'localhost',
    'return_path' => 'http://localhost:8000/callback'
]));
echo "Result with localhost -> " . curl_exec($ch) . "\n";

$ch2 = curl_init('https://forum.melonland.net/mAuth.php?mode=external');
curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch2, CURLOPT_POSTFIELDS, http_build_query([
    'client_key' => bin2hex(random_bytes(32)),
    'domain' => 'localhost:8000',
    'return_path' => 'http://localhost:8000/callback'
]));
echo "Result with localhost:8000 -> " . curl_exec($ch2) . "\n";
