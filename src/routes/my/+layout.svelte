<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import ProfileMenu from '$components/ProfileMenu.svelte';
	import Menu from '$components/Menu.svelte';
	import Note from '$components/Note.svelte';
	import Search from '$components/Search.svelte';
	import logo from '$lib/images/notes-main.png';
	import { tryFetch, isWriteQueueIdle, whenWriteQueueIdle } from '$lib/browserFetch';
	import { getBoardState } from '$lib/state/boardState.svelte';
	import { getToastMessages } from '$lib/state/toastMessages.svelte';
	import { setFriendsState, getFriendsState } from '$lib/state/friendsState.svelte';
	import { getUserState } from '$lib/state/userState.svelte';
	import {
		getBoardSnapshot,
		setBoardSnapshot,
		getFriendsSnapshot,
		setFriendsSnapshot
	} from '$lib/state/localCache';

	const persistDebounceMs = 400;
	const maxReconcileAttempts = 3;

	let { children, data } = $props();

	if (data.userData?.id) {
		setFriendsState(data.userData.id);
	}

	const boardState = getBoardState();
	const friendsState = getFriendsState();
	const toastMessages = getToastMessages();
	const userState = getUserState();
	const userId = data.userData?.id ?? '';

	userState.setName(data.userData?.name ?? '');

	async function refreshFromServer() {
		// Server is the source of truth, but only apply it when the optimistic
		// write queue is idle so in-flight local changes are not clobbered. If a
		// write races the fetch, retry so the re-fetch reflects the synced change.
		for (let attempt = 0; attempt < maxReconcileAttempts; attempt++) {
			await whenWriteQueueIdle();

			const [boardResp, friendsResp] = await Promise.all([
				fetch('/api/user/board'),
				fetch('/api/friends')
			]);
			if (!boardResp.ok || !friendsResp.ok) {
				throw new Error(
					`Failed to load data: board ${boardResp.status}, friends ${friendsResp.status}`
				);
			}
			const { board, sharedNotes, sharedNoteOwners } = await boardResp.json();
			const { friends, pendingSentInvites, pendingReceivedInvites } = await friendsResp.json();

			if (!isWriteQueueIdle()) {
				continue;
			}

			boardState.setBoard(board, friends, sharedNotes, sharedNoteOwners);
			friendsState.setState(friends, pendingSentInvites, pendingReceivedInvites);
			return;
		}
	}

	onMount(async () => {
		let hydratedFromCache = false;

		if (userId) {
			const [boardSnapshot, friendsSnapshot] = await Promise.all([
				getBoardSnapshot(userId),
				getFriendsSnapshot(userId)
			]);

			if (boardSnapshot) {
				boardState.hydrate(boardSnapshot);
				hydratedFromCache = true;
			}
			if (friendsSnapshot) {
				friendsState.hydrateState(friendsSnapshot);
			}
		}

		// With a cached snapshot we can paint immediately and refresh silently;
		// otherwise keep the skeleton until the first server response arrives.
		boardState.setLoading(!hydratedFromCache);
		friendsState.setLoading(!hydratedFromCache);

		try {
			await refreshFromServer();
		} catch (err) {
			console.error('Error loading data:', err);
			if (!hydratedFromCache) {
				toastMessages.addMessage({
					type: 'error',
					message: 'There was a problem loading your data'
				});
			}
		} finally {
			boardState.setLoading(false);
			friendsState.setLoading(false);
		}
	});

	// Persist state to the local cache (debounced) so the next load paints instantly.
	$effect(() => {
		const snapshot = $state.snapshot({
			boardId: boardState.boardId,
			noteOrder: boardState.noteOrder,
			notes: boardState.notes,
			friends: boardState.friends
		});

		if (!userId || boardState.loading) {
			return;
		}

		const timer = setTimeout(() => setBoardSnapshot(userId, snapshot), persistDebounceMs);
		return () => clearTimeout(timer);
	});

	$effect(() => {
		const snapshot = $state.snapshot({
			friends: friendsState.friends,
			pendingSentInvites: friendsState.pendingSentInvites,
			pendingReceivedInvites: friendsState.pendingReceivedInvites
		});

		if (!userId || friendsState.loading) {
			return;
		}

		const timer = setTimeout(() => setFriendsSnapshot(userId, snapshot), persistDebounceMs);
		return () => clearTimeout(timer);
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
