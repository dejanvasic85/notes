<script lang="ts">
	import { pushState } from '$app/navigation';
	import { page } from '$app/state';
	import { onDestroy, onMount, tick } from 'svelte';

	import type { Board as BoardModel, Note, NoteOrdered, ToggleFriendShare } from '$lib/types';
	import { NetworkUnavailableError, runOptimisticUpdate, tryFetch } from '$lib/browserFetch';
	import { generateId } from '$lib/identityGenerator';
	import { createBoardActions } from '$lib/state/boardActions';
	import { getBoardState } from '$lib/state/boardState.svelte';
	import { getToastMessages } from '$lib/state/toastMessages.svelte';
	import { enqueue } from '$lib/state/writeQueue.svelte';

	import Board from '$components/Board.svelte';
	import NoteList from '$components/NoteList.svelte';
	import Skeleton from '$components/Skeleton.svelte';

	// Uneven on purpose — the board it stands in for is content-sized.
	const skeletonHeights = ['h-32', 'h-48', 'h-24', 'h-40', 'h-28', 'h-36'];
	const boardState = getBoardState();
	const toastMessages = getToastMessages();
	const userId = page.data.userData?.id ?? '';
	const boardActions = createBoardActions(boardState, toastMessages, userId);

	onDestroy(() => boardActions.flushPendingDeletes());

	let loading = $derived(boardState.loading);
	let search = $derived(new URL(page.url).searchParams);
	let selectedNote = $derived(boardState.getNoteById(page.state.selectedNoteId));
	let filtered = $derived(boardState.filter(search.get('q')));
	let emptyMessage = $derived(
		filtered.length === 0 && search.get('q') !== null
			? 'No notes found'
			: 'Nothing to see yet! Go on create a note.'
	);

	onMount(async () => {
		await tick();
		const selectedNoteId = search.get('id');
		if (selectedNoteId) {
			pushState(`/my/board?id=${selectedNoteId}`, { selectedNoteId });
		}
	});

	function handleSelect({ id }: { id: string }) {
		pushState(`/my/board?id=${id}`, { selectedNoteId: id });
	}

	function handleClose() {
		pushState(`/my/board`, { selectedNoteId: null });
	}

	async function handleToggleFriendShare({
		id,
		friendUserId,
		noteId,
		selected
	}: ToggleFriendShare) {
		const noteEditor = boardState.toggleFriendShare({ id, friendUserId, noteId, selected });
		await tryFetch(
			`/api/notes/${noteId}/editors`,
			{
				method: 'POST',
				body: JSON.stringify(noteEditor)
			},
			{ shouldParse: false }
		);
	}

	// Returns whether the caller can safely treat the note as saved - either the
	// request succeeded, or it was queued for offline sync. NoteEditor uses this
	// to decide whether closing on a failed save should be allowed.
	async function handleSaveNote({ note }: { note: NoteOrdered }): Promise<boolean> {
		const result = await runOptimisticUpdate({
			apply: () => boardState.updateNote(note),
			request: ([updatedNote]) =>
				tryFetch<Note>(`/api/notes/${note.id}`, {
					method: 'PATCH',
					body: JSON.stringify({
						text: updatedNote.text,
						textPlain: updatedNote.textPlain,
						title: updatedNote.title,
						contentUpdatedAt: updatedNote.contentUpdatedAt
					})
				}),
			revert: ([, original]) => boardState.updateNote(original),
			errorMessage: 'Failed to update note. Try again.',
			toastMessages,
			onNetworkUnavailable: ([updatedNote]) =>
				enqueue(userId, {
					id: generateId('qm'),
					type: 'update-content',
					noteId: updatedNote.id,
					text: updatedNote.text,
					textPlain: updatedNote.textPlain,
					title: updatedNote.title,
					contentUpdatedAt: (updatedNote.contentUpdatedAt ?? new Date()).getTime(),
					queuedAt: Date.now()
				})
		});

		return result.type === 'ok' || result.value instanceof NetworkUnavailableError;
	}

	async function handleUpdateColour({ note }: { note: NoteOrdered }) {
		await runOptimisticUpdate({
			apply: () => boardState.updateNote(note),
			request: ([updatedNote]) =>
				tryFetch<Note>(`/api/notes/${note.id}`, {
					method: 'PATCH',
					body: JSON.stringify({
						colour: updatedNote.colour,
						colourUpdatedAt: updatedNote.colourUpdatedAt
					})
				}),
			revert: ([, original]) => boardState.updateNote(original),
			errorMessage: 'Failed to update note colour. Try again.',
			toastMessages,
			onNetworkUnavailable: ([updatedNote]) =>
				enqueue(userId, {
					id: generateId('qm'),
					type: 'update-colour',
					noteId: updatedNote.id,
					colour: updatedNote.colour,
					colourUpdatedAt: (updatedNote.colourUpdatedAt ?? new Date()).getTime(),
					queuedAt: Date.now()
				})
		});
	}

	function handleDelete({ note }: { note: NoteOrdered }) {
		boardActions.deleteNote(note);
		pushState(`/my/board`, { selectedNoteId: null });
	}

	async function handleReorder({ fromIndex, toIndex }: { fromIndex: number; toIndex: number }) {
		await runOptimisticUpdate({
			apply: () => boardState.reorderNotes(fromIndex, toIndex),
			request: ([noteOrder]) =>
				tryFetch<BoardModel>(`/api/board/${boardState.boardId}`, {
					method: 'PATCH',
					body: JSON.stringify({ noteOrder })
				}),
			revert: () => boardState.reorderNotes(toIndex, fromIndex),
			errorMessage: 'Failed to reorder notes. Try again.',
			toastMessages,
			onNetworkUnavailable: ([noteOrder]) =>
				enqueue(userId, {
					id: generateId('qm'),
					type: 'reorder',
					boardId: boardState.boardId,
					noteOrder,
					queuedAt: Date.now()
				})
		});
	}
</script>

<svelte:head>
	<title>My board with some notes on it</title>
	<meta name="description" content="My personal note board" />
</svelte:head>

{#if loading}
	<NoteList items={skeletonHeights} key={(heightClass) => heightClass}>
		{#snippet item(heightClass)}
			<Skeleton {heightClass} />
		{/snippet}
	</NoteList>
{:else}
	<Board
		{selectedNote}
		{emptyMessage}
		friends={boardState.friends}
		notes={filtered}
		enableSharing={true}
		onselect={handleSelect}
		onclosenote={handleClose}
		onsavenote={handleSaveNote}
		onupdatecolour={handleUpdateColour}
		ondeletenote={handleDelete}
		onreorder={handleReorder}
		ontogglefriend={handleToggleFriendShare}
	/>
{/if}
