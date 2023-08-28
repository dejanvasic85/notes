<script lang="ts">
	import { page } from '$app/stores';
	import type { User } from '@auth0/auth0-spa-js';

	import { withAuth } from '$lib/auth';

	const auth = withAuth();
	let user: User;
	auth.user.subscribe((value) => {
		user = value;
	});

	$: isLoggedIn = !!user;
	$: isLoggedOut = !user;
</script>

<header class="container mx-auto px-4">
	<nav class="flex justify-center space-x-4 pt-4">
		<a
			class="rounded-lg px-3 py-2 font-medium hover:bg-slate-100 hover:text-slate-900"
			href="/"
			aria-current={$page.url.pathname === '/' ? 'page' : undefined}>Home</a
		>

		{#if isLoggedOut}
			<a
				class="rounded-lg px-3 py-2 font-medium hover:bg-slate-100 hover:text-slate-900"
				href="/playground"
				aria-current={$page.url.pathname === '/playground' ? 'page' : undefined}>Playground</a
			>
			<button
				class="rounded-lg px-3 py-2 font-medium hover:bg-slate-100 hover:text-slate-900"
				on:click={auth.login}>Login</button
			>
		{/if}
		{#if isLoggedIn}
			<a
				class="rounded-lg px-3 py-2 font-medium hover:bg-slate-100 hover:text-slate-900"
				href="/board"
				aria-current={$page.url.pathname === '/board' ? 'page' : undefined}>Board</a
			>
			<button
				class="rounded-lg px-3 py-2 font-medium hover:bg-slate-100 hover:text-slate-900"
				on:click={auth.logout}
				>Logout
			</button>
		{/if}
	</nav>
</header>
