<script lang="ts">
	import { goto } from '$app/navigation';

	import ProfileMenu from '$components/ProfileMenu.svelte';
	import MobileMenu from '$components/MobileMenu.svelte';

	import logo from '$lib/images/notes-main.png';

	let { children, data } = $props();

	function handleAddNote() {
		goto('/my/board?new=true');
	}

	const userPicture = data.userData?.picture;
</script>

<div class="flex min-h-screen flex-col md:grid md:grid-cols-layout md:grid-rows-layout">
	<header
		class="sticky top-0 flex h-20 items-center justify-between border-b bg-white px-4 py-2 md:col-second dark:bg-dark"
	>
		<a href="/"><img src={logo} alt="Notes" class="size-14" /></a>
		{#if userPicture}
			<ProfileMenu {userPicture} />
		{/if}
	</header>
	<div class="relative mx-auto hidden w-20 border-r md:row-first-span-2 md:flex dark:bg-dark">
		<div class="fixed left-0 h-screen p-2">
			<MobileMenu onAddNote={handleAddNote} layout="vertical" />
		</div>
	</div>
	<div class="mb-20 overflow-y-auto px-4 py-2">{@render children()}</div>
	<div
		class="fixed inset-auto-0-0 bottom-0 flex h-20 items-center border-t bg-white p-2 md:hidden dark:bg-dark"
	>
		<MobileMenu onAddNote={handleAddNote} layout="horizontal" />
	</div>
</div>
