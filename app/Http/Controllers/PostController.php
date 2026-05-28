<?php

namespace App\Http\Controllers;

use App\Enums\FetchOrder;
use App\Enums\MemberType;
use App\Enums\NotificationType;
use App\Enums\PostType;
use App\Models\Conversation;
use App\Models\Notification;
use App\Models\Post;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class PostController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
       //ADD CHECK FOR 'category'

        $request->validate([
            'amount' => ['integer', 'required'],
            'category' => ['string', 'required'],
            'user_id' => ['integer', 'nullable'],
            'start_id' => ['integer', 'nullable'], //<--422
            'username' => ['string', 'nullable'],
            'fetch_order' => ['string', 'nullable']
        ]);
        
        $limit = $request->query('amount');
        $startId = $request->query('start_id');
        $postTypeString = $request->query('category');
        $postType = PostType::tryFrom($postTypeString);
        $isNews = $postType == PostType::News;
        
        //Log::info("Is news? $postTypeString , $isNews");

        $userId = $request->query('user_id');
        $username = $request->query('username');        
        $fetchOrderString = $request->query('fetch_order');
        $fetchOrderEnum = FetchOrder::tryFrom($fetchOrderString);
        $fetchOrder = $fetchOrderEnum ?? FetchOrder::Ascending;
        $user = (!isset($userId) && isset($username) ? 
            User::where('username', $username)
            : User::where('id', $userId))
            ->first();
        $userId = $user ? $user->id : null;
        //Log::info("user info for user, id $userId or name $username", $user->toArray());
                    
        if((isset($userId) || isset($username)) && !$user)
        {//user was given, but not found
            return response() ->json([
                'status' => 'user_not_found',
                'message' => 'No such user.'
            ], 404);
        }
        $query = Post::with(relations: 'user:id,username,avatar,member_type')
            ->where('is_news', $isNews)
            ->where('is_private', false);
        
        $query = $userId ? $query->where('user_id', $userId) : $query;

        $requestingUser = auth('api')->user();
        
        $isAdminRequest = false;
        if($requestingUser)
        {
            $isAdminRequest = $requestingUser->member_type == MemberType::Webmaster 
                || $requestingUser->member_type == MemberType::Admin;
        }
        if(!$userId || !$isAdminRequest) //only show admin-hidden posts to admins on the user's profile
        {
            $query = $query->where('is_hidden_by_admin', false);
        }

        $posts = [];

        switch($fetchOrder)
        {
            case FetchOrder::Ascending:
                $query = $startId ? $query->where('id', '>=', $startId) : $query;
                $posts = $query
                ->limit($limit)
                ->get();
                break;
            case FetchOrder::Descending:
                $query = $startId ? $query->where('id', '<=', $startId) : $query;
                $posts = $query
                ->limit($limit)
                ->latest()
                ->get();
                break;
            case FetchOrder::Random:
                $excludes = collect(explode(',', $request->excludes ?? ''))
                    ->filter(fn ($id) => is_numeric($id)) // only keep valid numbers
                    ->values()
                    ->toArray();

                if (!empty($excludes)) 
                {
                    $query->whereNotIn('id', $excludes);
                }

                $posts = $query
                    ->inRandomOrder()
                    ->limit($limit)
                    ->get();
                break;
        }        

        if(sizeof($posts) == 0)
        {
            return response() ->json([
            'status' => 'no_more_posts',
            'message' => 'No more posts available with the given parameters.'
        ], 200);
        }
        //Multiply posts for testing
        // $i = 0;
        // $nextId = $rawPosts[sizeof($rawPosts) - 1]->id + 1;
        // while(sizeof($posts) < 100)
        // {
        //     $duplicate = clone $rawPosts[$i];
        //     $duplicate->id = $nextId;
        //     array_push($posts, $duplicate);
        //     $i = ($i + 1) % sizeof($rawPosts);
        //     $nextId++;
        // }
        // $posts = array_filter($posts, function ($post) use ($startId) {
        //     return $post['id'] >= $startId;
        // });
        // $posts = array_slice($posts, 0, $limit);
        //remove the above part once testing is done
        return response()->json($posts->values());
    }

    public function myPosts(Request $request)
    {
        $userId = $request->user()->id;

        $request->validate([
            'amount' => ['integer', 'required'],
            'category' => ['string', 'required'],
            'user_id' => ['integer', 'nullable'],
            'start_id' => ['integer', 'nullable'], 
            //'fetch_order' => ['string', 'nullable']
        ]);

        $limit = $request->query('amount');
        $startId = $request->query('start_id');
        $postTypeString = $request->query('category');
        $postType = PostType::tryFrom($postTypeString);
        $isNews = $postType == PostType::News;

        Log::info($startId);
        $query = Post::with(relations: 'user:id,username')
            ->where('user_id', '=', $userId)
            ->where('is_news', $isNews);
        $rawPosts = ($startId ? $query->where('id', '<=', $startId) ://uncomment this for real implementation
            $query)
            ->latest()
            ->limit($limit)
            ->get();
            
        $posts = $rawPosts;
        // $posts = $rawPosts->filter(function ($post) use ($startId) 
        // {
        //     return $post['id'] >= $startId;
        // });
        // $requestData = [
        //     'url' => $request->fullUrl(),
        //     'method' => $request->method(),
        //     'headers' => $request->headers->all(),
        //     'body' => $request->all(), // This includes both query string and POST data
        //     'files' => $request->files->all(),
        //     'ip' => $request->ip(),
        //     'user_agent' => $request->header('User-Agent'),
        // ];
        if(sizeof($posts) == 0)
        {
            return response() ->json([
                'status' => 'no_more_posts',
                'message' => 'No more posts available with the given parameters.'
            ], 200);
        }
        //remove the above part once testing is done
        return response()->json($posts);
    }

    public function myLikedPosts(Request $request)
    {
        $userId = $request->user()->id;
        $limit = $request->query('amount');
        $pivotId = $request->query('start_id'); // We'll use this later

        $query = Post::select('posts.*', 'post_user.id as pivot_id', 'post_user.created_at as liked_at')
            ->join('post_user', 'posts.id', '=', 'post_user.post_id')
            ->where('post_user.user_id', $userId)
            ->with('user:id,username,avatar');

        if ($pivotId) 
        {
            $query->where('post_user.id', '<=', $pivotId);
        }

        $posts = $query
            ->orderBy('post_user.created_at', 'desc')
            ->limit($limit ?? 10)
            ->get();

        if ($posts->isEmpty()) {
            return response()->json([
                'status' => 'no_more_posts',
                'message' => 'No more liked posts.'
            ], 200);
        }

        return response()->json($posts);
    }
    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = $request->user();
        if(!$user->email_verified_at)
        {
            return response()->json(["error" => "Please verify your e-mail to begin posting."], 403);   
        }

        $basicFields = $request->validate
        ([
            'title' => ['string', 'required', 'max:255'],
            'subtitle' => ['string', 'required', 'max:255'],
            'main_video' => ['max:255', 'url', 'nullable'],
        ]); 
        $isPrivate = $request->input('is_private') ? true : false;        
        $isNews = $request->input('is_news') ? true : false;    

        if($isNews && $user->member_type != MemberType::Webmaster)
        {
            return response()->json(["error" => "Only webmasters can make news posts."], 403);   
        }
        
        $validatedPostUrlArray = $request->validate //should be unique among this user's posts
        ([            
            'post_url' => ['alpha_dash:ascii', 'max:255',
            Rule::unique('posts')->where(function ($query) use ($request)
            {
                return $query->where('user_id', $request->user()->id);
            })]
        ]);
        $postUrl = $validatedPostUrlArray['post_url'];

        $request->validate
        ([            
            'statement' => ['required', 'string'],//'json'],
            'gallery_images' => ['array'], // must be an array
            'gallery_images.*.alt' => ['nullable', 'string', 'max:255'],
            'gallery_images.*.file' => ['nullable', 'file', 'image', 'mimes:png,jpeg,jpg,webp,bmp', 'max:2048'], // 2MB limit
            //'gallery_images.*.url' => ['nullable', 'string'], //<-- shouldn't exist on a new post, cf. update()
            'website' => ['string', 'max:255', 'nullable'],   
            'source_code' => ['string', 'max:255', 'nullable']
        ],
            [
            'gallery_images.*.file.image' => 'Each uploaded file must be an image.',
        ]);

        $userName = $user->username;        
        $website = $request->input('website') ? addHttpProtocol($request->input('website', '')) : null;
        $sourceCode = $request->input('source_code') ? addHttpProtocol($request->input('source_code', '')) : null;

        $editorImageArray = [];
        $statementImageFolder = "users/$userName/posts/$postUrl/statement";
        $newStatementRaw = $request->input('statement');
        
        $statement = saveEditorImages($newStatementRaw,
            $editorImageArray, $statementImageFolder);
        $statement = sanitizeRichHtml($statement);

        $galleryArray = [];
        $galleryAltArray = [];
        $galleryImageFolder = "users/$userName/posts/$postUrl/gallery";
        $galleryImagesInput = $request->input('gallery_images', []);
        $uploadedFiles = $request->file('gallery_images', []);
        
        foreach($galleryImagesInput as $index => $item)
        {
            Log::info("Processing item at index: $index");
            $imageSet = false;
            if(array_key_exists($index, $uploadedFiles) 
                && $uploadedFiles[$index]['file'] instanceOf UploadedFile)
            {
                Log::info("Found a new file to upload.");
                $url = storeImageFile($uploadedFiles[$index]['file'], $galleryImageFolder);
                array_push($galleryArray, $url);
                $imageSet = true;
            } 
            else 
            {
                Log::info("Item at index $index is not a file. Skipping.");
            }
            if($imageSet)
            {
                $alt = $item['alt'] ?? null;
                array_push($galleryAltArray, $alt);
            }
        }
        
        $postFields = 
        [
            'post_url' => $postUrl,
            'user_id' => $request->user()->id,
            ...$basicFields,
            'website' => $website,
            'source_code' => $sourceCode,
            'is_private' => $isPrivate,
            'is_news' => $isNews,
            'gallery_image_urls' => $galleryArray,
            'gallery_alts' => $galleryAltArray,
            'statement' => $statement,
            'statement_image_urls' => $editorImageArray
        ];

        Post::create($postFields);
        return response()->json([
            'status' => 'post_created',
            'message' => 'Your post has been successfully created.'
        ], 200);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $username, string $post_url)
    {
        $user = User::where('username', $username)->first();
        if (!$user) 
        {
            return response()->json(['error' => 'No user by that name found.'], 404);
        }

        $query = Post::with([
            'user:id,username,avatar,member_type',
            'comments' => function ($query) 
            {
                // ...and for each comment, eager load its user, selecting specific fields
                $query->with('user:id,username,avatar');
                //    ->latest(); // Optional: order the comments by newest first
            }])
            ->withCount('usersWhoLiked')
            ->where('post_url', $post_url)
            ->where('user_id', $user->id);

        // The auth() helper works whether the route is protected or not.
        $authenticatedUser = auth('api')->user();
        //Log::info("authd?!: $authenticatedUser");
        if ($authenticatedUser) 
        {            
            $userId = $authenticatedUser->id;
            $query->withExists([
                'usersWhoLiked as have_liked' => function ($query) use ($userId) 
                {
                    $query->where('user_id', $userId);
                }
            ]);
            //Log::info("request's userId: $userId");
        }
        $post = $query->first();

        if (!$post) 
        {
            return response()->json(['error' => 'No such post found.'], 404);
        }

        $isPostCreator = $authenticatedUser && $authenticatedUser->id == $post->user_id;

        if ($post->is_private && !$isPostCreator)
        {
            return response()->json(['error' => 'No such post found.'], 404);
        }

        $isHidden = $post->is_hidden_by_admin;
        $isAdminRequest = $authenticatedUser && 
            ($authenticatedUser->member_type == MemberType::Webmaster 
            || $authenticatedUser->member_type == MemberType::Admin);
            
        $isPostCreatorRequest = $authenticatedUser && 
            ($authenticatedUser->id == $post->user_id);

        if($isHidden && !$isAdminRequest && !$isPostCreatorRequest)
        {
            return response()->json(['error' => 'No such post found.'], 404);
        }        
        
        $post->load('comments.user');

        return \Inertia\Inertia::render('Post/Show', ['post' => $post]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $username, string $post_url)
    {
        $authUser = auth('api')->user();
        $postCreator = User::where('username', $username)->first();

        if ($authUser->id != $postCreator->id)
        {
            return response()->json(['error' => 'No such post found.'], 404);
        }

        if (!$postCreator) 
        {
            return response()->json(['error' => 'No user by that name found.'], 404);
        }

        $query = Post::with([
            'user:id,username,avatar,member_type',
            'comments' => function ($query) 
            {
                // ...and for each comment, eager load its user, selecting specific fields
                $query->with('user:id,username,avatar');
                //    ->latest(); // Optional: order the comments by newest first
            }])
            ->withCount('usersWhoLiked')
            ->where('post_url', $post_url)
            ->where('user_id', $postCreator->id);

        //Log::info("authd?!: $authenticatedUser");
        $post = $query->first();

        if (!$post) 
        {
            return response()->json(['error' => 'No such post found.'], 404);
        }
        
        return \Inertia\Inertia::render('Post/Show', ['post' => $post]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {        
        $user = $request->user();
        if(!$user->email_verified_at)
        {
            return response()->json(["error" => "Please verify your e-mail to begin posting."], 403);   
        }
        Log::info($request->headers->get('content-type'));
        $requestData = [
            'url' => $request->fullUrl(),
            'method' => $request->method(),
            'headers' => $request->headers->all(),
            'body' => $request->all(), // This includes both query string and POST data
            'files' => $request->files->all(),
            'ip' => $request->ip(),
            'user_agent' => $request->header('User-Agent'),
        ];
        Log::info('Incoming request data:', $requestData);
        
        $basicFields = $request->validate
        ([
            'post_url' => 
            [
                'required',
                'alpha_dash:ascii',
                'max:255',
                // Rule to check for uniqueness, but ignore the current post's URL.
                Rule::unique('posts')->ignore($id)->where(function ($query) use ($request) {
                    return $query->where('user_id', $request->user()->id);
                })
            ],
            'title' => ['string', 'required', 'max:255'],
            'subtitle' => ['string', 'required', 'max:255'],
            'main_video' => ['max:255'],     
        ]); 
        $isPrivate = $request->input('is_private') ? true : false; 
        $isNews = $request->input('is_news') ? true : false;
        Log::info("isPrivate? $isPrivate _ $request->input('is_private')");       

        $post = Post::findOrFail($id);

        if($request->user()->id != $post->user_id)
        {
            return response()->json([ "error" => "This is not your post to edit."], 403);
        }

        $postUrl = $post->post_url;        
        $request->validate([
            'statement' => ['required', 'string'],
            'gallery_images' => ['array'], // must be an array
            'gallery_images.*.alt' => ['nullable', 'string', 'max:255'],
            'gallery_images.*.file' => ['nullable', 'file', 'image', 'mimes:png,jpeg,jpg,webp,bmp', 'max:2048'], // 2MB limit
            'gallery_images.*.url' => ['nullable', 'string'],
            'website' => ['string', 'max:255', 'nullable'],
        ],
            [
            'gallery_images.*.file.image' => 'Each uploaded file must be an image.',
        ]);       
        
        $userName = $user->username;         
        $galleryImageFolder = "users/$userName/posts/$postUrl/gallery";
        
        $allowedExistingUrls = $post->gallery_image_urls ?? [];
        $galleryImagesInput = $request->input('gallery_images', []);
        $uploadedFiles = $request->file('gallery_images', []);

        $updatedGalleryUrls = [];
        $updatedGalleryAlts = [];

        // Iterate through the input data array, which holds the correct order.
        foreach ($galleryImagesInput as $index => $item) 
        {
            Log::info("Processing item at index: $index");
            $imageSet = false;
            if(array_key_exists($index, $uploadedFiles) 
                && $uploadedFiles[$index]['file'] instanceOf UploadedFile)
            {
                Log::info("Found a new file to upload.");
                $url = storeImageFile($uploadedFiles[$index]['file'], $galleryImageFolder);
                array_push($updatedGalleryUrls, $url);
                $imageSet = true;
            } 
            // Otherwise, assume it's a string URL from an existing image.
            else if (isset($item['url']) && $item['url']) 
            {
                if (in_array($item['url'], $allowedExistingUrls)) 
                {
                    $url = $item['url'];
                    Log::info("Found and verified an existing image URL: $url");
                    array_push($updatedGalleryUrls, $url);
                    $imageSet = true;
                } 
                else 
                {
                    Log::warning("Unauthorized or invalid URL rejected: " . $item['url']);
                }
            } 
            else 
            {
                Log::info("Item at index $index is neither a file nor a string URL. Skipping.");
            }
            if($imageSet)
            {
                $alt = $item['alt'] ?? null;
                array_push($updatedGalleryAlts, $alt);
            }
        }

        $oldGalleryUrls = $post->gallery_image_urls;

        Log::info("updated gallery urls", $updatedGalleryUrls);
        if (is_array($oldGalleryUrls)) 
        {
            foreach ($oldGalleryUrls as $index => $oldUrl) 
            {
                Log::info("old url: $oldUrl");// , updated$updatedGalleryUrls[$index]")
                if (!in_array($oldUrl, $updatedGalleryUrls)) 
                {
                    deleteGalleryImages($oldUrl, $galleryImageFolder);
                }
            }
        }
        $editorImageArray = $post->statement_image_urls;

        $statementImageFolder = "users/$userName/posts/$postUrl/statement";
        $rawStatement = $request->input('statement');
        $statement = saveEditorImages($rawStatement,
            $editorImageArray, $statementImageFolder);
        $statement = sanitizeRichHtml($statement);
                
        //Log::info("updating post. is_news: $isNews");
        $website = $request->input('website') ? addHttpProtocol($request->input('website', '')) : null;
        
        $postFields = 
        [
            ...$basicFields,
            'website' => $website,
            'is_private' => $isPrivate,
            'is_news' => $isNews,
            'gallery_image_urls' => $updatedGalleryUrls,//$galleryJson,
            'gallery_alts' => $updatedGalleryAlts,//$galleryAltsJson,
            'statement' => $statement,//$statementJson,
            'statement_image_urls' => $editorImageArray//$statementImagesJson
        ];

        $post->update($postFields);
        return response() ->json([
            'status' => 'post_updated',
            'message' => 'Your post has been successfully updated.'
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, string $id)
    {
        $post = Post::findOrFail($id);
        $requestingUser = $request->user();
        $isAdminRequest = $requestingUser->member_type == MemberType::Webmaster 
                || $requestingUser->member_type == MemberType::Admin;
        if($requestingUser->id != $post->user_id && !$isAdminRequest)
        {
            return response()->json([ "error" => "This is not your post to delete."], 403);
        }
        $userName = $requestingUser->username;
        $postUrl = $post->post_url;
        $postFolder = "images/uploaded/users/$userName/posts/$postUrl";
        Storage::disk('public')->deleteDirectory($postFolder);

        $post->delete();

        return response() ->json([
            'status' => 'post_updated',
            'message' => 'Post successfully deleted.'
        ], 200);
    }

    
    public function toggleAdminHide(Request $request, Post $post)
    {        
        $request->merge([
            'is_hidden_by_admin' => $request->boolean('is_hidden_by_admin'),
        ]);

        $request->validate([
            "is_hidden_by_admin" => "nullable|boolean",
            "message_to_user" => "nullable|string"
        ]);
        
        $user = $request->user();
        if($user->member_type != MemberType::Webmaster
         && $user->member_type != MemberType::Admin)
        {
            return response()->json([
                "message" => "Only the webmaster and admins can hide posts."
            ], 401);
        }
        if($user->member_type != MemberType::Webmaster
         && $post->user->member_type == MemberType::Webmaster)
        {
            return response()->json([
                "message" => "An admin cannot hide the webmaster's posts."
            ], 401);
        }
        
        $hideIt = isset($request["is_hidden_by_admin"]) && $request["is_hidden_by_admin"];
        $messageToUser = $request["message_to_user"] ?? null;
        
        if($hideIt && $messageToUser)
        {
            //send a DM
            $postTitle = $post->title;
            $name = "Your post, <em>$postTitle</em>, has been hidden";
            $conversation = Conversation::create([
                'is_group' => false,
                'name' => $name
            ]);
            $conversation->users()->attach([
                $user->id,
                $post->user->id
            ]);

            $editorImageArray = [];
            $userName = $user->username;
            $messageImageFolder = "users/$userName/messages";
            $newContentRaw = $messageToUser;
            
            $messageToUser = saveEditorImages($newContentRaw,
                $editorImageArray, $messageImageFolder);
                
            $conversation->messages()->create([
                'sender_id' => $user->id,
                'content' => $messageToUser
            ]);
            //send an e-mail
        }
        else if(!$hideIt)
        {
            Notification::create([
                'user_id' => $post->user->id,
                'type' => NotificationType::Unhidden,
                'data' => ['post_id' => $post->id]
            ]);
        }
        
        $post->is_hidden_by_admin = $hideIt;
        $post->save();

        $responseMsg = $hideIt ? "Post successfully hidden" : "Post successfully unhidden";
        
        $post->load([
            'user' => function ($query) 
            {
                $query->select('id', 'username', 'avatar', 'member_type');
            },
            'comments' => function ($query) {
                // Nested eager load the user for every comment
                $query->with('user:id,username,avatar')->latest();
            }]);

        return response()->json([
            "message" => $responseMsg,
            "post" => $post
        ], 200);
    }
}
