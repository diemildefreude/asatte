<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    
    <!-- Static URLs -->
    <url>
        <loc>{{ url('/') }}</loc>
        <lastmod>{{ now()->tz('UTC')->toAtomString() }}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>{{ url('/news') }}</loc>
        <lastmod>{{ now()->tz('UTC')->toAtomString() }}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>
    <url>
        <loc>{{ url('/contact') }}</loc>
        <lastmod>{{ now()->tz('UTC')->toAtomString() }}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.5</priority>
    </url>

    <!-- User Profile URLs -->
    @foreach ($users as $user)
        <url>
            <loc>{{ url('/' . $user->username) }}</loc>
            <lastmod>{{ $user->updated_at->tz('UTC')->toAtomString() }}</lastmod>
            <changefreq>weekly</changefreq>
            <priority>0.8</priority>
        </url>
    @endforeach

    <!-- Public Post URLs -->
    @foreach ($posts as $post)
        @if ($post->user)
            <url>
                <loc>{{ url('/' . $post->user->username . '/' . $post->slug) }}</loc>
                <lastmod>{{ $post->updated_at->tz('UTC')->toAtomString() }}</lastmod>
                <changefreq>monthly</changefreq>
                <priority>0.9</priority>
            </url>
        @endif
    @endforeach

</urlset>
