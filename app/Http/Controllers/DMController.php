<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class DMController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $amount = intval($request->query('amount', 10));
        $page = intval($request->query('page', 1));

        // Subquery to isolate the created_at timestamp of the absolute newest message in each conversation
        $latestMessageTimeQuery = Message::select('created_at')
            ->whereColumn('conversation_id', 'conversations.id')
            ->latest()
            ->take(1);

        $query = Conversation::with(['users', 'latestMessage.sender:id,username'])
            ->whereHas('users', function($q) use ($user) {
                $q->where('users.id', $user->id);
            })
            // 1. Select all default conversation columns
            ->select('conversations.*')
            // 2. Append the calculated subquery value so it is accessible as a temporary model attribute
            ->addSelect([
                'latest_message_created_at' => $latestMessageTimeQuery
            ])
            // 3. Keep your existing optimized subquery ordering logic intact
            ->orderBy($latestMessageTimeQuery, 'desc');

        $conversations = $query->paginate($amount, ['*'], 'page', $page);

        Log::info("DMs indexed", $conversations->toArray());
        
        return Inertia::render('dashboard/Mail', [
            'conversations' => $conversations,
        ]);
    }

    public function create(Request $request)
    {
        $addressee = null;
        if ($request->has('addressee')) {
            $addressee = \App\Models\User::where('username', $request->query('addressee'))
                ->select('id', 'username', 'avatar')->first();
        }

        return Inertia::render('dashboard/Conversation', [
            'addressee' => $addressee
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //Log::info("DM", $request->toArray());
        //return;
        $request->validate([
            'subject' => ['nullable', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'recipients'   => ['array', 'min:1'],
            'recipients.*' => ['integer', 'exists:users,id'],
            'conversation_id' => ['integer', 'exists:conversations,id']
        ]);
        //return;
        
        $user = $request->user();
        $userName = $user->name;
        $userId = $user->id;
        
        $conversationId = $request->input('conversation_id');

        if ($conversationId) 
        {
            // 1. Fetch the conversation
            $conversation = Conversation::findOrFail($conversationId);
    
            // 2. CONCRETE SECURITY CHECK: Verify user belongs to the conversation_user table
            $isParticipant = $conversation->users()->where('user_id', $userId)->exists();
    
            if (!$isParticipant) 
            {
                return back()->withInput()->with([
                    'status' => 'error',
                    'error_message' => 'You do not have permission to post in this conversation.'
                ]);
            }
        }
        else 
        {
            // Create a new conversation if no conversation_id was provided
            $recipients = $request->input('recipients');
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
        $content = sanitizeRichHtml($content);

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
        return redirect()->route('dashboard.mail.show', $conversation->id)->with('new_message_id', $newestMessageID);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, string $id)
    {                
        $user = $request->user();

        $conversation = Conversation::with('users')
        ->where('id', $id)
        ->whereHas('users', function($q) use ($user)
        {
            $q->where('users.id', $user->id);
        })
        ->first();
        
        if(!$conversation)
        {
            abort(404);
        }
        
        $conversation->users()->updateExistingPivot($user->id, [
            'last_read_at' => now()
        ]);

        $conversation->load(['messages.sender:id,username,avatar']);
        
        return Inertia::render('dashboard/Conversation', [
            'conversationProp' => $conversation,
        ]);
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
        $newContent = sanitizeRichHtml($newContent);
        
        $message->update([
            'content' => $newContent,
            'image_urls' => $editorImageArray
        ]);

        $conversation = Conversation::findOrFail($message->conversation_id);
        $conversation->load(['users', 'messages.sender:id,username,avatar']);
        return back()->with('success', 'Your message has been successfully updated.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, string $id)
    {
        $user = $request->user();
        $message = Message::where('id', $id)
            ->where('sender_id', $user->id)
            ->firstOrFail();

        $conversation = Conversation::where('id', $message->conversation_id)
        ->withCount('messages')
        ->first();

        if (!$conversation) 
        {
            abort(404);
        }

        if($conversation->messages_count <= 1)
        {
            $conversation->delete(); 
            return redirect()->route('dashboard.mail.index')->with('success', 'Conversation deleted.');
        }
        
        $message->delete();

        return back()->with('success', 'Message deleted.');
    }
}
