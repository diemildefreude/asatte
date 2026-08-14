<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$p = App\Models\Post::where('title', 'like', '%Compression Classroom%')->first(); 
if($p) { 
    echo json_encode($p->toArray());
} else {
    echo "Not found";
}
