<script>
	import { page } from '$app/stores';
</script>

<header class="container mx-auto px-4">
	<nav class="flex sm:justify-center space-x-4 pt-4">
		<a
			class="rounded-lg px-3 py-2 text-slate-700 font-medium hover:bg-slate-100 hover:text-slate-900"
			href="/"
			aria-current={$page.url.pathname === '/' ? 'page' : undefined}>Home</a
		>
		<a
			class="rounded-lg px-3 py-2 text-slate-700 font-medium hover:bg-slate-100 hover:text-slate-900"
			href="/about"
			aria-current={$page.url.pathname === '/about' ? 'page' : undefined}>About</a
		>
		<a
			class="rounded-lg px-3 py-2 text-slate-700 font-medium hover:bg-slate-100 hover:text-slate-900"
			href="/playground"
			aria-current={$page.url.pathname === '/playground' ? 'page' : undefined}>Playground</a
		>
	</nav>
</header>
