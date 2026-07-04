<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | (CORS). This determines the list of domains / origins that are allowed
    | to make cross-origin HTTP requests to your application.
    |
    */

    'paths' => [
        'api/*',
        'oauth/token',      // <-- allow token requests/refreshes

    ],

    'allowed_methods' => ['*'],

    'allowed_origins' => ['https://asatte.io', 'https://www.asatte.io', 'http://localhost:8000'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];