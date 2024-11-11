<script lang="ts">
	import { onMount } from 'svelte';

	let scrolled = false;
	const handlerScroll = () => (scrolled = window.scrollY > 10);

	onMount(() => {
		window.addEventListener('scroll', handlerScroll);

		return () => {
			window.removeEventListener('scroll', handlerScroll);
		};
	});

	$: scrolledClass = scrolled ? 'header-bg' : 'bg-transparent';
</script>

<header
	class="h-18 container sticky top-0 mx-auto border-b-2 bg-background px-4 py-2 dark:bg-dark {scrolledClass}"
>
	<slot />
</header>

<style>
	.header-bg {
		box-shadow: 1px 1px 10px #0006;
		backdrop-filter: blur(10px);
	}
</style>
