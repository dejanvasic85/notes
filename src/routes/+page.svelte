<script>
	import Button from '$components/Button.svelte';
	import logo from '$lib/images/notes-main.png';
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Personal note taking application and sharing with family" />
</svelte:head>

<header class="borderpx-6 container mx-auto h-20 max-w-6xl border-b-2">
	<nav class="flex w-full items-center justify-between">
		<img src={logo} alt="Notes" class="size-20" />
		<Button>Login</Button>
	</nav>
</header>

<section
	class="hero-bg flex flex-[0.6] flex-col items-center justify-center gap-8 rounded-xl"
>
	<h1 class="text-6xl md:text-8xl">
		Take Notes
		<span class="block font-bold text-primary">Privately</span>
	</h1>

	<p class="text-lg md:text-xl">
		Your Notes, Your <span class="font-bold text-secondary">Data</span>, Your
		<span class="font-bold text-tertiary">Peace of Mind</span>.
	</p>

	<div class="flex gap-2">
		<a
			href="/playground"
			class="rounded-lg border-2 border-secondary px-6 py-3 text-secondary transition-colors duration-300 hover:bg-secondary/90 hover:text-white md:text-lg"
			>Try the playground</a
		>
		<a
			href="/api/auth/login?screen_hint=register"
			class="rounded-lg border-2 border-tertiary px-6 py-3 text-tertiary transition-colors duration-300 hover:bg-tertiary/90 hover:text-white md:text-lg"
			>Get started</a
		>
	</div>
</section>
