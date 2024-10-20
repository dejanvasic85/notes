<script>
	import { PUBLIC_BUILD } from '$env/static/public';

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
		Made with love using <a
			href="https://kit.svelte.dev"
			target="_blank"
			class="cursor-pointer font-bold underline">svelte</a
		>
		<p>
			Build: {PUBLIC_BUILD} | <a href="/privacy" class="font-bold underline">Privacy policy</a> |
			<a href="/terms" class="font-bold underline">Terms of service</a>
		</p>
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
