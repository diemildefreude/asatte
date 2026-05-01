<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class DMController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $request->validate([
            'items_per_page' => ['required', 'integer'],
            'current_page' => ['required', 'integer'],
        ]);

        $user = $request->user();//auth('api')->user();
        $itemsPerPage = $request->items_per_page; //5
        $currentPage = $request->current_page - 1;

        $query = Conversation::with(['users', 'latestMessage.sender:id,username'])
        ->whereHas('users', function($q) use ($user)
        {
            $q->where('users.id', $user->id);
        })->orderBy(Message::select('created_at')
            ->whereColumn('conversation_id', 'conversations.id')
            ->latest()
            ->take(1),
            'desc'
        );
        // Sort by the subquery result, fallback to conversation created_at if no messages exist
        //->orderByRaw('COALESCE(last_message_at, conversations.created_at) DESC');

        $totalCount = $query->count();

        $conversations = $query->skip($itemsPerPage * $currentPage)
        ->take($itemsPerPage)
        ->get();

        //Log::info("total count is $totalCount");
        return response()->json([
            'conversations' => $conversations,
            'total' => $totalCount], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        Log::info("DM", $request->toArray());
        //return;
        $request->validate([
            'subject' => ['string', 'max:255'],
            'content' => ['required', 'string'],
            'recipients'   => ['array', 'min:1'],
            'recipients.*' => ['integer', 'exists:users,id'],
            'conversation_id' => ['integer', 'exists:conversations,id']
        ]);
        //return;
        
        $user = $request->user();
        $userName = $user->name;
        $userId = $user->id;
        $recipients = $request->input('recipients');

        $conversation = $request->input('conversation_id') ? 
            Conversation::where('id', $request->input('conversation_id'))
            ->firstOrFail() 
            : null;
        if(!$conversation)
        {
            $recipients = $request->input('recipients') ?? null;
            $name = $request->input('subject') ?? null;
            $isGroup = sizeof($recipients) > 1;
            $conversation = Conversation::create([
                'is_group' => $isGroup,
                'name' => $name
            ]);
            $conversation->users()->attach([
                $userId,
                ...$recipients
            ]);
        }
        $editorImageArray = [];
        $messageImageFolder = "users/$userName/messages";
        $newContentRaw = $request->input('content');
        
        $content = saveEditorImages($newContentRaw,
            $editorImageArray, $messageImageFolder);


        $conversation->messages()->create([
            'sender_id' => $userId,
            'content' => $content
        ]);

        $newestMessageID = $conversation->messages()->count() - 1;
        
        // $conversationMessages = $conversation->messages()
        // ->with('sender:id,username,avatar')->get();

        $conversation->load([
            'users',
            'messages.sender:id,username,avatar',
        ]);
        return response()->json([
            'status' => 'message sent',
            'message' => 'Your message has been sent.',
            'conversation' => $conversation,
            'new_message_id' => $newestMessageID
        ], 200);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {                
        $user = auth('api')->user();

        $conversation = Conversation::with('users')
        ->where('id', $id)
        ->whereHas('users', function($q) use ($user)
        {
            $q->where('users.id', $user->id);
        })
        ->first();
        
        if(!$conversation)
        {
            return response() ->json([
                'status' => 'conversation_not_found',
                'message' => 'Conversation unavailable.'
            ], 404);
        }
        
        $conversation->users()->updateExistingPivot($user->id, [
            'last_read_at' => now()
        ]);

        $conversation->load(['messages.sender:id,username,avatar']);
        return response()->json([
            'conversation' => $conversation
        ],200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $request->validate([
            'content' => ['required', 'string']
        ]);
        $userId = $request->user()->id;
        $userName = $request->user()->username;
        $message = Message::where('id', $id)
            ->where('sender_id', $userId)
            ->firstOrFail();
        $editorImageArray = $message->image_urls; 
        $messageImageFolder = "users/$userName/messages";
        $newContentRaw = $request->input('content');
        $newContent = saveEditorImages($newContentRaw, 
            $editorImageArray, $messageImageFolder);
        
        $message->update([
            'content' => $newContent,
            'image_urls' => $editorImageArray
        ]);

        $conversation = Conversation::findOrFail($message->conversation_id);
        $conversation->load(['users', 'messages.sender:id,username,avatar']);
        return response()->json([
            'status' => 'message_updated',
            'message' => 'Your message has been successfully updated.',
            'conversation' => $conversation
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user = auth('api')->user();
        $message = Message::where('id', $id)
            ->where('sender_id', $user->id)
            ->firstOrFail();

        $conversation = Conversation::where('id', $message->conversation_id)
        ->withCount('messages')
        ->first();

        if (!$conversation) 
        {
            return response()->json([
                'status' => 'conversation_not_found',
                'message' => 'Conversation not found'
            ], 404);
        }

        if($conversation->messages_count <= 1)
        {
            $conversation->delete(); 
            return response()->json([
                'status' => 'conversation_deleted',
                'message' => 'Conversation deleted.'
            ], 200);
        }
        
        $message->delete();

        $conversation->load(['messages.sender:id,username,avatar']);
       $conversation->loadCount('messages');
    
       return response()->json([
            'status' => 'message_deleted',
            'message' => 'Message deleted.',
            'conversation' => $conversation
        ], 200);

    }
}
