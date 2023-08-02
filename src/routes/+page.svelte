<script>
	import welcome from '$lib/images/svelte-welcome.webp';
	import welcome_fallback from '$lib/images/svelte-welcome.png';
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section class="flex flex-[0.6] flex-col items-center justify-center">
	<h1 class="w-full">
		<span class="relative block h-0 w-full">
			<picture>
				<source srcset={welcome} type="image/webp" />
				<img src={welcome_fallback} alt="Welcome" class="absolute top-0 block w-full" />
			</picture>
		</span>
	</h1>
</section>

<p class="text-center">A barebones note taking app. Something that fits on a post-it note...</p>

<p class="text-center mt-2">
	Try it out by using the <a href="/playground" class="underline">playground.</a>
</p>
