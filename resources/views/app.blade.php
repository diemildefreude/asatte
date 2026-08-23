<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Favicons & App Manifest -->
        <link rel="icon" type="image/svg+xml" href="/images/favicon/favicon_old.svg" sizes="any">
        <link rel="apple-touch-icon" sizes="180x180" href="/images/favicon/apple-touch-icon.png">
        <link rel="manifest" crossorigin="use-credentials" href="/images/favicon/site.webmanifest">
        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Cascadia+Code:ital,wght@0,200..700;1,200..700&display=swap" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?Fjalla+One&family=Fjalla+One&family=Saira:ital,wght@0,100..900;1,100..900&family=Source+Code+Pro:ital,wght@0,200..900;1,200..900" rel="stylesheet">
        <script src="https://kit.fontawesome.com/dfd3e08cad.js" crossorigin="anonymous"></script>
        <!-- Scripts -->
        
        <!-- <script src="https://cdn.jsdelivr.net/npm/eruda"></script>
        <script>eruda.init();</script> -->

        <!-- Dynamic Open Graph / Twitter Meta Tags for Scrapers & Social Shares -->
        @php
            $post = $page['props']['post'] ?? null;
            $profileUser = $page['props']['profileUser'] ?? null;
            
            $ogTitle = config('app.name', 'asatte.io');
            $ogDesc = 'The premiere hub for Internet Art.';
            $ogImage = url('/images/og_image0.webp');
            $ogType = 'website';

            if ($post) {
                $ogTitle = ($post['title'] ?? '') . ($post['subtitle'] ? ' - ' . $post['subtitle'] : '');
                if (!empty($post['statement'])) {
                    $ogDesc = \Illuminate\Support\Str::limit(trim(strip_tags($post['statement'])), 160);
                }
                $gallery = $post['gallery_image_urls'] ?? [];
                if (!empty($gallery) && isset($post['user']['username'])) {
                    $username = $post['user']['username'];
                    $postUrl = $post['post_url'];
                    $firstImg = is_array($gallery) ? $gallery[0] : (json_decode($gallery, true)[0] ?? null);
                    if ($firstImg) {
                        $ogImage = url("/storage/images/uploaded/users/{$username}/posts/{$postUrl}/gallery/large/{$firstImg}");
                    }
                }
                $ogType = 'article';
            } elseif ($profileUser) {
                $ogTitle = ($profileUser['username'] ?? '') . ' on asatte.io';
                if (!empty($profileUser['bio'])) {
                    $ogDesc = \Illuminate\Support\Str::limit(trim(strip_tags($profileUser['bio'])), 160);
                }
                if (!empty($profileUser['avatar_path'])) {
                    $ogImage = url('/storage/images/uploaded/users/' . $profileUser['username'] . '/avatar/' . $profileUser['avatar_path']);
                }
                $ogType = 'profile';
            }
        @endphp
        <meta property="og:site_name" content="asatte.io">
        <meta property="og:url" content="{{ url()->current() }}">
        <meta property="og:type" content="{{ $ogType }}">
        <meta property="og:title" content="{{ $ogTitle }}">
        <meta property="og:description" content="{{ $ogDesc }}">
        <meta property="og:image" content="{{ $ogImage }}">
        <meta property="og:image:width" content="1200">
        <meta property="og:image:height" content="630">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:url" content="{{ url()->current() }}">
        <meta name="twitter:title" content="{{ $ogTitle }}">
        <meta name="twitter:description" content="{{ $ogDesc }}">
        <meta name="twitter:image" content="{{ $ogImage }}">

        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body>
        @inertia
    </body>
</html>
