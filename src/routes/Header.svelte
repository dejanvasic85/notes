<script lang="ts">
	import { page } from '$app/stores';
	import type { User } from '@auth0/auth0-spa-js';

	import HeaderLink from '$components/HeaderLink.svelte';
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
		<HeaderLink label="Home" path="/" />
		<HeaderLink label="Playground" path="/playground" />
		{#if isLoggedOut}
			<button on:click={auth.login}>Login</button>
		{/if}
		{#if isLoggedIn}
			<HeaderLink label="My Board" path="/my-board" />
			<HeaderLink label="Friends" path="/friends" />
			<HeaderLink label="Logout" type="button" on:click={auth.logout} />
		{/if}
	</nav>
</header>
