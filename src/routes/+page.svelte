<script>
	import Button from '$components/Button.svelte';
	import logo from '$lib/images/notes-main.png';
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Personal note taking application and sharing with family" />
</svelte:head>

<header class="borderpx-6 container mx-auto h-20">
	<nav class="flex w-full items-center justify-between">
		<img src={logo} alt="Notes" class="size-20" />
		<Button>Login</Button>
	</nav>
</header>

<section class="flex w-full flex-[0.6] flex-col items-center justify-center">
	<h1 class="text-6xl">
		Take Notes
		<span class="block font-bold text-primary">Privately</span>
	</h1>
	<p class="mt-8 text-lg">Your Notes, Your Data, Your Peace of Mind</p>
</section>
