<script lang="ts">
	import { goto } from '$app/navigation';
	import ProfileMenu from '$components/ProfileMenu.svelte';
	import Menu from '$components/Menu.svelte';
	import Note from '$components/Note.svelte';
	import Search from '$components/Search.svelte';
	import logo from '$lib/images/notes-main.png';
	import { tryFetch } from '$lib/browserFetch';
	import { getBoardState } from '$lib/state/boardState.svelte';
	import { getToastMessages } from '$lib/state/toastMessages.svelte';
	import { setFriendsState } from '$lib/state/friendsState.svelte';
	import { getUserState } from '$lib/state/userState.svelte';

	let { children, data } = $props();
	const boardState = getBoardState();
	const toastMessages = getToastMessages();
	const userState = getUserState();

	userState.setName(data.userData?.name ?? '');

	if (data.userData?.id) {
		setFriendsState(data.userData.id);
	}

	async function handleCreateNote() {
		const newNote = boardState.createNewNote();
		goto(`/my/board?id=${newNote.id}`, {
			state: { selectedNoteId: newNote.id },
			replaceState: true
		});

		if (navigator.vibrate) {
			navigator.vibrate(50);
		}

		const resp = await tryFetch<Note>('/api/notes', {
			method: 'POST',
			body: JSON.stringify(newNote)
		});

		if (resp.type === 'error') {
			boardState.deleteNoteById(newNote.id);
			goto('/my/board');
			toastMessages.addMessage({
				type: 'error',
				message: 'There was a problem creating a note. Try again.'
			});
		}
	}
</script>

<div class="flex min-h-screen flex-col md:grid md:grid-cols-layout md:grid-rows-layout">
	<!-- Header -->
	<header
		class="sticky top-0 z-menu flex h-20 items-center justify-between gap-4 border-b bg-white px-4 py-2 md:col-second dark:border-b-darkBorder dark:bg-dark"
	>
		<a href="/"><img src={logo} alt="Notes" class="size-14" /></a>
		<Search />
		{#if data.userData}
			<ProfileMenu
				userPicture={data.userData.picture!}
				email={data.userData.email!}
				name={userState.name}
			/>
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
	<main class="mb-20 overflow-y-auto p-4 lg:p-8">{@render children()}</main>

	<!-- Mobile Menu -->
	<div
		class="fixed inset-auto-0-0 bottom-0 flex h-16 items-center border-t bg-white p-2 md:hidden dark:border-t-darkBorder dark:bg-dark"
	>
		<Menu oncreatenote={handleCreateNote} layout="horizontal" />
	</div>
</div>
