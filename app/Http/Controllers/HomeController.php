<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Contracts\View\View;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function __invoke(Request $request): View
    {
        $search = (string) $request->string('q');

        $featuredPosts = Post::query()
            ->featured()
            ->latest('published_at')
            ->take(5)
            ->get();

        $recentPosts = Post::query()
            ->published()
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($nestedQuery) use ($search) {
                    $nestedQuery
                        ->where('title', 'like', "%{$search}%")
                        ->orWhere('excerpt', 'like', "%{$search}%")
                        ->orWhere('content', 'like', "%{$search}%");
                });
            })
            ->latest('published_at')
            ->paginate(9)
            ->withQueryString();

        return view('pages.home', [
            'featuredPosts' => $featuredPosts,
            'recentPosts' => $recentPosts,
            'search' => $search,
        ]);
    }
}
