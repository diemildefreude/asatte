<?php

namespace App\Http\Controllers;

use App\Enums\MemberType;
use App\Models\About;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class AboutController extends Controller
{
    public function show()
    {
        $about = About::first();

        if($about)
        {
            return \Inertia\Inertia::render('About', ['status' => 'about_fetched', 'about' => $about]);
        }

        return \Inertia\Inertia::render('About', ['status' => 'no_about_statement_found', 'about' => null]);
    }
    public function update(Request $request)
    {
        $validatedFields = $request->validate([
            'statement' => ['required', 'string']
        ]);

        $user = $request->user();

        if(!$user || $user->member_type != MemberType::Webmaster)
        {
            return back()->withInput()->with([
                'status' => 'unauthorized',
                'error_message' => 'Only the webmaster can make changes.'
            ]);
        }

        $about = About::first();
        $imageArray = $about->statement_image_urls ?? [];
        $imageFolder = "about";
        //$newStatementArray = json_decode($validatedFields['statement']);
        $newStatementRaw = $validatedFields['statement'];

        $newStatement = saveEditorImages($newStatementRaw, $imageArray, $imageFolder);
        $newStatement = sanitizeRichHtml($newStatement);
        if($about)
        {
            $about->statement = $newStatement;
            $about->statement_image_urls = $imageArray;
            $about->save();
        }
        else
        {
            $about = About::create([
                'statement' => $newStatement,
                'statement_image_urls' => $imageArray
            ]);
        }

        $response = [
            'status' => "about_updated",
            'message' => "About statement has been updated successfully.",
            'about' => $about
        ];
        $request->session()->flash('success', $response['message']);
        return redirect()->route('about');
    }
}