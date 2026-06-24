@extends('layouts.app')

@section('title', 'Bacon Side')

@section('content')
    <section class="space-y-8">
        @if ($featuredPosts->isNotEmpty())
            <div
                x-data="{
                    index: 0,
                    items: {{ $featuredPosts->count() }},
                    init() {
                        if (this.items > 1) {
                            setInterval(() => this.index = (this.index + 1) % this.items, 5000);
                        }
                    }
                }"
                class="surface-card relative overflow-hidden p-4 sm:p-8"
            >
                <div class="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-zinc-400/20 blur-2xl"></div>
                <div class="pointer-events-none absolute -bottom-10 -left-6 h-40 w-40 rounded-full bg-slate-400/20 blur-3xl"></div>

                <div class="relative">
                    @foreach ($featuredPosts as $featured)
                        <article x-show="index === {{ $loop->index }}" x-transition.opacity.duration.500ms>
                            <div class="mb-3 flex flex-wrap items-center gap-2">
                                <span class="badge border-zinc-400/50 bg-zinc-300/10">Destaque</span>
                                <span class="badge border-zinc-500/40 bg-zinc-300/10">
                                    {{ $featured->type === 'review' ? 'Review' : 'Noticia' }}
                                </span>
                                <span class="badge border-zinc-500/40 bg-zinc-300/10">{{ strtoupper($featured->category) }}</span>
                            </div>
                            <h1 class="max-w-4xl font-serif text-3xl font-semibold leading-tight sm:text-5xl">
                                <a href="{{ route('posts.show', $featured) }}" class="hover:opacity-90">
                                    {{ $featured->title }}
                                </a>
                            </h1>
                            <p class="mt-4 max-w-3xl text-[rgb(var(--muted))]">
                                {{ $featured->excerpt ?: \Illuminate\Support\Str::limit(strip_tags($featured->content), 160) }}
                            </p>
                            <div class="mt-6">
                                <a href="{{ route('posts.show', $featured) }}" class="inline-flex items-center gap-2 rounded-xl border border-[rgb(var(--border))] px-4 py-2 text-sm font-medium">
                                    Ler agora
                                </a>
                            </div>
                        </article>
                    @endforeach
                </div>

                @if ($featuredPosts->count() > 1)
                    <div class="relative mt-6 flex items-center gap-2">
                        @foreach ($featuredPosts as $dot)
                            <button
                                type="button"
                                @click="index = {{ $loop->index }}"
                                class="h-2.5 w-8 rounded-full transition"
                                :class="index === {{ $loop->index }} ? 'bg-zinc-200' : 'bg-zinc-600/50'"
                                aria-label="Ir para slide {{ $loop->iteration }}"
                            ></button>
                        @endforeach
                    </div>
                @endif
            </div>
        @endif

        <section>
            <div class="mb-4 flex items-center justify-between">
                <h2 class="text-2xl font-semibold tracking-tight">Publicacoes recentes</h2>
                @if ($search)
                    <p class="text-sm text-[rgb(var(--muted))]">Resultado para: "{{ $search }}"</p>
                @endif
            </div>

            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                @forelse ($recentPosts as $post)
                    <article class="surface-card flex h-full flex-col overflow-hidden">
                        @if ($post->featured_image)
                            <img src="{{ asset('storage/' . $post->featured_image) }}" alt="{{ $post->title }}" class="h-44 w-full object-cover">
                        @endif
                        <div class="flex h-full flex-col p-4">
                            <div class="mb-3 flex flex-wrap items-center gap-2">
                                <span class="badge border-zinc-500/40 bg-zinc-300/10">
                                    {{ $post->type === 'review' ? 'Review' : 'Noticia' }}
                                </span>
                                <span class="badge border-zinc-500/40 bg-zinc-300/10">{{ strtoupper($post->category) }}</span>
                                @if ($post->rating)
                                    <span class="badge border-amber-500/40 bg-amber-500/10 text-amber-300">{{ $post->rating }}/5</span>
                                @endif
                            </div>

                            <h3 class="text-lg font-semibold leading-tight">
                                <a href="{{ route('posts.show', $post) }}" class="hover:opacity-90">{{ $post->title }}</a>
                            </h3>

                            <p class="mt-2 text-sm text-[rgb(var(--muted))]">
                                {{ $post->excerpt ?: \Illuminate\Support\Str::limit(strip_tags($post->content), 120) }}
                            </p>

                            <div class="mt-4 pt-2 text-xs text-[rgb(var(--muted))]">
                                {{ optional($post->published_at)->translatedFormat('d M Y') }}
                            </div>
                        </div>
                    </article>
                @empty
                    <p class="col-span-full rounded-xl border border-dashed border-[rgb(var(--border))] p-8 text-center text-[rgb(var(--muted))]">
                        Nenhum post publicado ainda.
                    </p>
                @endforelse
            </div>

            <div class="mt-6">
                {{ $recentPosts->links() }}
            </div>
        </section>
    </section>
@endsection
