<script lang="ts">
	import Header from '$components/Header.svelte';
	import HeaderProfileMenu from '$components/HeaderProfileMenu.svelte';
	import MobileMenu from '$components/MobileMenu.svelte';

	import logo from '$lib/images/notes-main.png';

	export let data;

	const userPicture = data.userData?.picture;
</script>

<div class="flex flex-col gap-8">
	<Header fullWidth={true}>
		<nav class="flex w-full items-center justify-between">
			<a class="transition-all duration-150 hover:scale-125" href="/my/board"
				><img src={logo} alt="Notes" class="size-14" /></a
			>
			{#if userPicture}
				<HeaderProfileMenu {userPicture} />
			{/if}
		</nav>
	</Header>

	<slot />

	<MobileMenu />
</div>
