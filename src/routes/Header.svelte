<script lang="ts">
	import HeaderLink from '$components/HeaderLink.svelte';

	export let isAuthenticated: boolean;
	export let name: string | null | undefined;
</script>

<header class="container mx-auto px-4">
	<nav class="flex justify-center space-x-4 pt-4">
		<HeaderLink label="Home" path="/" />
		<HeaderLink label="Playground" path="/playground" />
		{#if isAuthenticated}
			<HeaderLink label="My Board" path="/my/board" />
			<HeaderLink label="Friends" path="/my/friends" />
			<HeaderLink label="Logout" path="/api/auth/logout" />
			<div class="px-3 py-2 inline-block">Hello <span class="font-bold">{name}</span></div>
		{:else}
			<HeaderLink label="Login" path="/api/auth/login" />
		{/if}
	</nav>
</header>
