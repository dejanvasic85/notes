<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import ProfileMenu from '$components/ProfileMenu.svelte';
	import Menu from '$components/Menu.svelte';
	import Note from '$components/Note.svelte';
	import OfflineIndicator from '$components/OfflineIndicator.svelte';
	import Search from '$components/Search.svelte';
	import logo from '$lib/images/notes-main.png';
	import { tryFetch, NetworkUnavailableError } from '$lib/browserFetch';
	import { generateId } from '$lib/identityGenerator';
	import { playCue } from '$lib/sound';
	import { getBoardState } from '$lib/state/boardState.svelte';
	import { setConnectivityState } from '$lib/state/connectivityState.svelte';
	import { getToastMessages } from '$lib/state/toastMessages.svelte';
	import {
		clearPausedNotes,
		drain,
		enqueue,
		registerReplayOnReconnect
	} from '$lib/state/writeQueue.svelte';
	import { setFriendsState, getFriendsState } from '$lib/state/friendsState.svelte';
	import { getUserState } from '$lib/state/userState.svelte';
	import {
		refreshFromServer,
		hydrateFromCache,
		setupLocalCachePersistence
	} from '$lib/state/boardSync.svelte';

	let { children, data } = $props();

	if (data.userData?.id) {
		setFriendsState(data.userData.id);
	}

	const boardState = getBoardState();
	const friendsState = getFriendsState();
	const toastMessages = getToastMessages();
	const userState = getUserState();
	const connectivityState = setConnectivityState();
	const userId = data.userData?.id ?? '';

	userState.setName(data.userData?.name ?? '');

	onMount(async () => {
		const { boardHydrated, friendsHydrated } = await hydrateFromCache(
			userId,
			boardState,
			friendsState
		);

		// With a cached snapshot we can paint immediately and refresh silently;
		// otherwise keep the skeleton until the first server response arrives.
		boardState.setLoading(!boardHydrated);
		friendsState.setLoading(!friendsHydrated);

		try {
			await refreshFromServer(boardState, friendsState, connectivityState.isOffline);
		} catch (err) {
			console.error('Error loading data:', err);
			if (!boardHydrated && !friendsHydrated) {
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

	setupLocalCachePersistence(userId, boardState, friendsState);

	// Refetch after a drain so any conflict-losing field gets corrected.
	registerReplayOnReconnect(userId, async () => {
		try {
			await refreshFromServer(boardState, friendsState, connectivityState.isOffline);
		} catch (err) {
			console.error('Error reconciling after write queue drain:', err);
		}
	});

	// Manual retry from OfflineIndicator's toast - paused notes skip auto-drain.
	async function handleRetrySync() {
		try {
			clearPausedNotes();
			const result = await drain(userId);
			if (!result.drainedAny) {
				return;
			}
			await refreshFromServer(boardState, friendsState, connectivityState.isOffline);
		} catch (err) {
			console.error('Error retrying write queue sync:', err);
		}
	}

	async function handleCreateNote() {
		const newNote = boardState.createNewNote();
		playCue('pop');
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
			if (resp.value instanceof NetworkUnavailableError) {
				await enqueue(userId, {
					id: generateId('qm'),
					type: 'create',
					note: newNote,
					queuedAt: Date.now()
				});
				return;
			}

			boardState.deleteNoteById(newNote.id);
			goto('/my/board');
			toastMessages.addMessage({
				type: 'error',
				message: 'There was a problem creating a note. Try again.'
			});
		}
	}

	function isEditableTarget(target: EventTarget | null): boolean {
		if (!(target instanceof HTMLElement)) {
			return false;
		}
		return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
	}

	function handleWindowKeydown(e: KeyboardEvent) {
		const isNoteEditorOpen = document.getElementById('note-editor') !== null;
		if (!(e.ctrlKey || e.metaKey) || isEditableTarget(e.target) || isNoteEditorOpen) {
			return;
		}

		const key = e.key.toLowerCase();

		if (key === 'k') {
			e.preventDefault();
			document.getElementById('search')?.focus();
			return;
		}

		if (key === 'n') {
			e.preventDefault();
			handleCreateNote();
		}
	}
</script>

<svelte:window onkeydown={handleWindowKeydown} />

<div class="md:grid-cols-layout md:grid-rows-layout flex min-h-screen flex-col md:grid">
	<!-- Header -->
	<header
		class="z-menu md:col-second bg-paper sticky top-0 flex h-20 items-center justify-between gap-4 border-b px-4 py-2"
	>
		<a href="/"><img src={logo} alt="Notes" class="size-14" /></a>
		<Search />
		<div class="flex items-center gap-3">
			<OfflineIndicator onretry={handleRetrySync} />
			{#if data.userData}
				<ProfileMenu
					userPicture={data.userData.picture!}
					email={data.userData.email!}
					name={userState.name}
				/>
			{/if}
		</div>
	</header>

	<!-- Side menu -->
	<div class="md:row-first-span-2 bg-paper relative mx-auto hidden w-20 border-r md:flex">
		<div class="fixed left-0 h-screen p-2">
			<Menu oncreatenote={handleCreateNote} layout="vertical" />
		</div>
	</div>

	<!-- Main content -->
	<main class="mb-20 overflow-y-auto p-4 lg:p-8">{@render children()}</main>

	<!-- Mobile Menu -->
	<div class="inset-auto-0-0 bg-paper fixed bottom-0 flex h-16 items-center border-t p-2 md:hidden">
		<Menu oncreatenote={handleCreateNote} layout="horizontal" />
	</div>
</div>
