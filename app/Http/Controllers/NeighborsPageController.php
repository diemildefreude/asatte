<?php

namespace App\Http\Controllers;

use App\Enums\MemberType;
use App\Models\NeighborsPage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Symfony\Component\HttpFoundation\Response;

class NeighborsPageController extends Controller
{
    public function show()
    {
        $neighborsPage = NeighborsPage::first();

        if($neighborsPage)
        {
            return \Inertia\Inertia::render('Neighbors', [
                'status' => 'neighbors_page_fetched',
                'neighbors' => $neighborsPage,
                'neighborsPage' => $neighborsPage,
            ]);
        }

        return \Inertia\Inertia::render('Neighbors', [
            'status' => 'no_neighbors_statement_found',
            'neighbors' => null,
            'neighborsPage' => null,
        ]);
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

        $neighborsPage = NeighborsPage::first();
        $imageArray = $neighborsPage->statement_image_urls ?? [];
        $imageFolder = "neighbors";
        $newStatementRaw = $validatedFields['statement'];

        $newStatement = saveEditorImages($newStatementRaw, $imageArray, $imageFolder);
        $newStatement = sanitizeRichHtml($newStatement);
        if($neighborsPage)
        {
            $neighborsPage->statement = $newStatement;
            $neighborsPage->statement_image_urls = $imageArray;
            $neighborsPage->save();
        }
        else
        {
            $neighborsPage = NeighborsPage::create([
                'statement' => $newStatement,
                'statement_image_urls' => $imageArray
            ]);
        }

        $response = [
            'status' => "neighbors_page_updated",
            'message' => "Neighbors statement has been updated successfully.",
            'neighbors' => $neighborsPage,
            'neighborsPage' => $neighborsPage
        ];
        $request->session()->flash('success', $response['message']);
        if (Route::has('neighbors')) {
            return redirect()->route('neighbors');
        }
        return redirect()->back();
    }
}
