<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import ProfileMenu from '$components/ProfileMenu.svelte';
	import Menu from '$components/Menu.svelte';
	import Note from '$components/Note.svelte';
	import Search from '$components/Search.svelte';
	import logo from '$lib/images/notes-main.png';
	import { tryFetch } from '$lib/browserFetch';
	import { getBoardState } from '$lib/state/boardState.svelte';
	import { getToastMessages } from '$lib/state/toastMessages.svelte';
	import { setFriendsState, getFriendsState } from '$lib/state/friendsState.svelte';
	import { getUserState } from '$lib/state/userState.svelte';

	let { children, data } = $props();

	if (data.userData?.id) {
		setFriendsState(data.userData.id);
	}

	const boardState = getBoardState();
	const friendsState = getFriendsState();
	const toastMessages = getToastMessages();
	const userState = getUserState();

	userState.setName(data.userData?.name ?? '');

	onMount(async () => {
		boardState.setLoading(true);
		friendsState.setLoading(true);

		const [boardResp, friendsResp] = await Promise.all([
			fetch('/api/user/board'),
			fetch('/api/friends')
		]);

		try {
			const { board, sharedNotes, sharedNoteOwners } = await boardResp.json();
			const { friends, pendingSentInvites, pendingReceivedInvites } = await friendsResp.json();
			boardState.setBoard(board, friends, sharedNotes, sharedNoteOwners);
			friendsState.setState(friends, pendingSentInvites, pendingReceivedInvites);
		} catch (err) {
			console.error('Error loading data:', err);
			toastMessages.addMessage({
				type: 'error',
				message: 'There was a problem loading your data'
			});
		} finally {
			boardState.setLoading(false);
			friendsState.setLoading(false);
		}
	});

	async function handleCreateNote() {
		const newNote = boardState.createNewNote();
		goto(`/my/board?id=${newNote.id}`, {
			state: { selectedNoteId: newNote.id },
			replaceState: true
		});

		if (navigator.vibrate) {
			navigator.vibrate(50);
		}

		const resp = await tryFetch<Note>(
			'/api/notes',
			{
				method: 'POST',
				body: JSON.stringify(newNote)
			},
			{
				clearQueueOnError: true
			}
		);

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

<div class="md:grid-cols-layout md:grid-rows-layout flex min-h-screen flex-col md:grid">
	<!-- Header -->
	<header
		class="z-menu md:col-second dark:border-b-dark-border dark:bg-dark sticky top-0 flex h-20 items-center justify-between gap-4 border-b bg-white px-4 py-2"
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
		class="md:row-first-span-2 dark:border-r-dark-border dark:bg-dark relative mx-auto hidden w-20 border-r bg-white md:flex"
	>
		<div class="fixed left-0 h-screen p-2">
			<Menu oncreatenote={handleCreateNote} layout="vertical" />
		</div>
	</div>

	<!-- Main content -->
	<main class="mb-20 overflow-y-auto p-4 lg:p-8">{@render children()}</main>

	<!-- Mobile Menu -->
	<div
		class="inset-auto-0-0 dark:border-t-dark-border dark:bg-dark fixed bottom-0 flex h-16 items-center border-t bg-white p-2 md:hidden"
	>
		<Menu oncreatenote={handleCreateNote} layout="horizontal" />
	</div>
</div>
