<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = App\Models\User::where('username', 'dreamer')->first();
$request = Illuminate\Http\Request::create('/posts', 'POST', [
    'post_url' => 'test-post',
    'title' => 'Test Post',
    'subtitle' => 'Test Subtitle',
    'is_private' => '0',
    'is_draft' => '0',
    'is_news' => '0',
    'statement' => '<p>test</p>',
    'gallery_images' => [] // maybe empty array causes validation error?
]);
$request->setUserResolver(function () use ($user) {
    return $user;
});

try {
    $controller = new App\Http\Controllers\PostController();
    $response = $controller->store($request);
    echo "Success: ";
    print_r($response);
} catch (Illuminate\Validation\ValidationException $e) {
    echo "Validation failed:\n";
    print_r($e->errors());
} catch (\Exception $e) {
    echo "Exception:\n";
    echo $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}
