<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Contracts\View\View;

class PostController extends Controller
{
    public function show(Post $post): View
    {
        abort_unless($post->status === 'published' && $post->published_at?->isPast(), 404);

        $relatedPosts = Post::query()
            ->published()
            ->where('category', $post->category)
            ->whereKeyNot($post->getKey())
            ->latest('published_at')
            ->take(4)
            ->get();

        return view('pages.post', [
            'post' => $post,
            'relatedPosts' => $relatedPosts,
        ]);
    }
}
