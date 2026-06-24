<!DOCTYPE html>
<html
    lang="pt-BR"
    x-data="{
        theme: localStorage.getItem('theme') || 'dark',
        init() {
            this.applyTheme();
        },
        toggleTheme() {
            this.theme = this.theme === 'dark' ? 'light' : 'dark';
            localStorage.setItem('theme', this.theme);
            this.applyTheme();
        },
        applyTheme() {
            document.documentElement.classList.toggle('dark', this.theme === 'dark');
        }
    }"
    x-init="init()"
>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Bacon Side')</title>
    <meta name="description" content="Bacon Side: reviews de filmes, series e noticias do universo nerd/geek.">
    <script>
        (function () {
            var theme = localStorage.getItem('theme') || 'dark';
            document.documentElement.classList.toggle('dark', theme === 'dark');
        })();
    </script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet">
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="atmo-grid">
    <header class="sticky top-0 z-50 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg))]/85 backdrop-blur-xl">
        <div class="shell flex h-16 items-center justify-between gap-4">
            <a href="{{ route('home') }}" class="inline-flex items-center gap-2">
                <span class="text-sm font-medium text-[rgb(var(--muted))]">magazine</span>
                <span class="text-xl font-bold tracking-tight">Bacon Side</span>
            </a>

            <div class="flex items-center gap-2 sm:gap-3">
                <form action="{{ route('home') }}" method="GET" class="hidden sm:block">
                    <label for="q" class="sr-only">Buscar</label>
                    <input
                        id="q"
                        name="q"
                        value="{{ request('q') }}"
                        placeholder="Buscar reviews e noticias"
                        class="w-72 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] px-3 py-2 text-sm text-[rgb(var(--fg))] placeholder:text-[rgb(var(--muted))] focus:outline-none focus:ring-2 focus:ring-zinc-400/50"
                    >
                </form>

                <button
                    type="button"
                    @click="toggleTheme()"
                    class="inline-flex items-center rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] px-3 py-2 text-sm font-medium"
                >
                    <span x-show="theme === 'dark'">Light</span>
                    <span x-show="theme === 'light'">Dark</span>
                </button>
            </div>
        </div>
    </header>

    <main class="shell py-8">
        @yield('content')
    </main>

    <footer class="mt-8 border-t border-[rgb(var(--border))] bg-[rgb(var(--bg))]/90">
        <div class="shell flex flex-col gap-4 py-8 text-sm text-[rgb(var(--muted))] sm:flex-row sm:items-center sm:justify-between">
            <p>
                Bacon Side, {{ now()->year }}. Reviews e noticias do universo nerd/geek.
            </p>

            <div class="flex items-center gap-4">
                <a href="{{ route('home') }}" class="transition hover:text-[rgb(var(--fg))]">Home</a>
                <a href="{{ url('/admin') }}" class="transition hover:text-[rgb(var(--fg))]">Painel</a>
            </div>
        </div>
    </footer>
</body>
</html>
