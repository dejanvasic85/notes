<script lang="ts">
	import { onMount } from 'svelte';
	export let fullWidth = false;

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
	class="z-50 h-16 {fullWidth
		? 'w-full'
		: 'container'} sticky top-0 mx-auto border-b-2 bg-background p-2 px-4 dark:bg-dark {scrolledClass} "
>
	<slot />
</header>

<style>
	.header-bg {
		flex: 0 0 auto;
		box-shadow: 1px 1px 10px #0006;
		backdrop-filter: blur(100px);
	}
</style>
