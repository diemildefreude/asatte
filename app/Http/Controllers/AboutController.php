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
            return response()->json([
                "status" => "about_fetched",
                "about" => $about
            ]);
        }

        return response()->json([
            "status" => "no_about_statement_found",
            "about" => null
        ], 200);
    }
    public function update(Request $request)
    {
        $validatedFields = $request->validate([
            'statement' => ['required', 'json']
        ]);

        $user = auth('api')->user();

        if($user->member_type != MemberType::Webmaster)
        {
            return response()->json([
                'message' => 'Only the webmaster can make changes.',
                'status' => 'unauthorized'
            ], Response::HTTP_FORBIDDEN); //403
        }

        $about = About::first();
        $imageArray = $about->statement_image_urls ?? [];
        $imageFolder = "about";
        $newStatementArray = json_decode($validatedFields['statement']);
        Log::info("saveEditorArgs", [
            "newStatementArray" => gettype($newStatementArray),
            "imageArray" => gettype($imageArray),
            "imageFolder" => gettype($imageFolder)
        ]);
        $newStatement = saveEditorImages($newStatementArray, $imageArray, $imageFolder);

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

        return response()->json([
            'status' => "about_updated",
            'message' => "About statement has been updated successfully.",
            'about' => $about
        ], 200);
    }
}