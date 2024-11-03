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

	$: scrolledClass = scrolled ? 'header-bg rounded-lg' : 'bg-transparent';
</script>

<header class="h-18 container sticky top-0 mx-auto border-b-2 px-4 py-2 lg:w-8/12 {scrolledClass}">
	<slot />
</header>

<style>
	.header-bg {
		background-color: hsl(0 0% 98% / 80%);
		box-shadow: 1px 1px 10px #0006;
		backdrop-filter: blur(10px);
	}
</style>
