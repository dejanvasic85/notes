<script lang="ts">
	import { goto } from '$app/navigation';
	import Header from '$components/Header.svelte';
	import HeaderProfileMenu from '$components/HeaderProfileMenu.svelte';
	import MobileMenu from '$components/MobileMenu.svelte';

	import logo from '$lib/images/notes-main.png';

	let { children, data } = $props();

	function handleAddNote() {
		goto('/my/board?new=true');
	}

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

	{@render children()}

	<MobileMenu onAddNote={handleAddNote} />
</div>
