<script lang="ts">
	import ProfileMenu from '$components/ProfileMenu.svelte';
	import Menu from '$components/Menu.svelte';
	import logo from '$lib/images/notes-main.png';
	import { MaybeType, tryFetch } from '$lib/fetch';
	import { getDialogState } from '$lib/state/dialogState.svelte';
	import { getBoardState } from '$lib/state/boardState.svelte';
	import { goto } from '$app/navigation';
	import Note from '$components/Note.svelte';

	let { children, data } = $props();
	const layoutState = getDialogState();
	const boardState = getBoardState();

	async function handleCreateNote() {
		const newNote = boardState.createNewNote();
		const resp = await tryFetch<Note>('/api/notes', {
			method: 'POST',
			body: JSON.stringify(newNote)
		});

		if (resp.type === MaybeType.Error) {
			boardState.deleteNoteById(newNote.id);
			goto('/my/board');
		} else {
			goto(`/my/board?id=${newNote.id}`);
		}
	}

	const userPicture = data.userData?.picture;
</script>

<div class="flex min-h-screen flex-col md:grid md:grid-cols-layout md:grid-rows-layout">
	<!-- Header -->
	<header
		class="sticky top-0 {layoutState.isDialogOpen
			? ''
			: 'z-10'} flex h-20 items-center justify-between border-b bg-white px-4 py-2 md:col-second dark:border-b-darkBorder dark:bg-dark"
	>
		<a href="/"><img src={logo} alt="Notes" class="size-14" /></a>
		{#if userPicture}
			<ProfileMenu {userPicture} />
		{/if}
	</header>

	<!-- Side menu -->
	<div
		class="relative mx-auto hidden w-20 border-r bg-white md:row-first-span-2 md:flex dark:border-r-darkBorder dark:bg-dark"
	>
		<div class="fixed left-0 h-screen p-2">
			<Menu oncreatenote={handleCreateNote} layout="vertical" />
		</div>
	</div>

	<!-- Main content -->
	<main class="mb-20 overflow-y-auto p-8">{@render children()}</main>

	<!-- Mobile Menu -->
	<div
		class="fixed inset-auto-0-0 bottom-0 flex h-20 items-center border-t bg-white p-2 md:hidden dark:border-t-darkBorder dark:bg-dark"
	>
		<Menu oncreatenote={handleCreateNote} layout="horizontal" />
	</div>
</div>
