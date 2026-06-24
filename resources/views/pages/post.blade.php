@extends('layouts.app')

@section('title', $post->title . ' | Bacon Side')

@section('content')
    <article class="grid gap-8 lg:grid-cols-12">
        <div class="lg:col-span-8">
            <header class="mb-6 space-y-4">
                <div class="flex flex-wrap items-center gap-2">
                    <span class="badge border-zinc-500/40 bg-zinc-300/10">
                        {{ $post->type === 'review' ? 'Review' : 'Noticia' }}
                    </span>
                    <span class="badge border-zinc-500/40 bg-zinc-300/10">{{ strtoupper($post->category) }}</span>
                    @if ($post->rating)
                        <span class="badge border-amber-500/40 bg-amber-500/10 text-amber-300">{{ $post->rating }}/5</span>
                    @endif
                </div>

                <h1 class="font-serif text-4xl font-semibold leading-tight sm:text-5xl">{{ $post->title }}</h1>

                <div class="text-sm text-[rgb(var(--muted))]">
                    {{ optional($post->published_at)->translatedFormat('d M Y, H:i') }}
                </div>

                @if ($post->featured_image)
                    <img src="{{ asset('storage/' . $post->featured_image) }}" alt="{{ $post->title }}" class="mt-2 h-auto w-full rounded-2xl border border-[rgb(var(--border))] object-cover">
                @endif
            </header>

            @if ($post->spoiler_alert)
                <section x-data="{ revealed: false }" class="surface-card mb-6 overflow-hidden">
                    <div class="border-b border-[rgb(var(--border))] bg-red-500/10 p-4 text-sm font-medium text-red-300">
                        Alerta de spoiler: este review contem detalhes importantes da trama.
                    </div>
                    <div class="p-4">
                        <button
                            type="button"
                            @click="revealed = !revealed"
                            class="mb-4 inline-flex rounded-xl border border-[rgb(var(--border))] px-4 py-2 text-sm font-medium"
                        >
                            <span x-show="!revealed">Revelar Spoiler</span>
                            <span x-show="revealed">Ocultar Conteudo</span>
                        </button>

                        <div class="transition" :class="revealed ? '' : 'blur-sm select-none pointer-events-none'">
                            <div class="prose prose-zinc max-w-none dark:prose-invert prose-headings:font-serif prose-a:text-zinc-400">
                                {!! $post->content !!}
                            </div>
                        </div>
                    </div>
                </section>
            @else
                <div class="prose prose-zinc max-w-none dark:prose-invert prose-headings:font-serif prose-a:text-zinc-400">
                    {!! $post->content !!}
                </div>
            @endif
        </div>

        <aside class="lg:col-span-4">
            <div class="surface-card p-4">
                <h2 class="mb-4 text-lg font-semibold">Posts relacionados</h2>

                <div class="space-y-4">
                    @forelse ($relatedPosts as $related)
                        <a href="{{ route('posts.show', $related) }}" class="block rounded-xl border border-[rgb(var(--border))] p-3 transition hover:bg-[rgb(var(--bg-soft))]">
                            <div class="mb-2 flex items-center gap-2">
                                <span class="badge border-zinc-500/40 bg-zinc-300/10">{{ strtoupper($related->category) }}</span>
                                @if ($related->rating)
                                    <span class="badge border-amber-500/40 bg-amber-500/10 text-amber-300">{{ $related->rating }}/5</span>
                                @endif
                            </div>
                            <h3 class="text-sm font-semibold leading-snug">{{ $related->title }}</h3>
                            <p class="mt-2 text-xs text-[rgb(var(--muted))]">{{ optional($related->published_at)->translatedFormat('d M Y') }}</p>
                        </a>
                    @empty
                        <p class="text-sm text-[rgb(var(--muted))]">Sem posts relacionados nesta categoria.</p>
                    @endforelse
                </div>
            </div>
        </aside>
    </article>
@endsection
