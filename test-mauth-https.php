<?php
$ch = curl_init('https://forum.melonland.net/mAuth.php?mode=external');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
    'client_key' => bin2hex(random_bytes(32)),
    'domain' => '127.0.0.1:8000',
    'return_path' => 'https://127.0.0.1:8000/callback'
]));
$res = curl_exec($ch);
echo "Result with HTTPS absolute: " . $res . "\n";
