<script>
	import { PUBLIC_BUILD } from '$env/static/public';
	import github from '$lib/images/github.svg';

	//import Header from './Header.svelte';
	import './app.css';

	//export let data;
</script>

<div class="flex min-h-screen flex-col">
	<!-- <Header isAuthenticated={data.isAuthenticated} name={data.userData?.name} /> -->

	<main>
		<slot />
	</main>

	<footer class="p-4 text-center">
		Made with <a href="https://kit.svelte.dev" target="_blank" class="font-bold underline">svelte</a
		>
		- Github
		<a href="https://github.com/dejanvasic85/notes" target="_blank"
			><img src={github} alt="Github" class="inline h-8 w-8" /></a
		>
		Build: {PUBLIC_BUILD}
	</footer>
</div>

<style>
	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		margin: 0 auto;
		box-sizing: border-box;
	}
</style>
