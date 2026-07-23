<script lang="ts">
	import { pushState } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount, tick } from 'svelte';

	import type { Board as BoardModel, Note, NoteOrdered, ToggleFriendShare } from '$lib/types';
	import { runOptimisticUpdate, tryFetch } from '$lib/browserFetch';
	import { getBoardState } from '$lib/state/boardState.svelte';
	import { getToastMessages } from '$lib/state/toastMessages.svelte';

	import Board from '$components/Board.svelte';
	import NoteList from '$components/NoteList.svelte';
	import NoteContainer from '$components/NoteContainer.svelte';
	import Skeleton from '$components/Skeleton.svelte';

	const numberOfSkeletons = 4;
	const boardState = getBoardState();
	const toastMessages = getToastMessages();

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

	async function handleUpdate({ note }: { note: NoteOrdered }) {
		await runOptimisticUpdate({
			apply: () => boardState.updateNote(note),
			request: ([updatedNote]) =>
				tryFetch<Note>(`/api/notes/${note.id}`, {
					method: 'PATCH',
					body: JSON.stringify(updatedNote)
				}),
			revert: ([, original]) => boardState.updateNote(original),
			errorMessage: 'Failed to update note. Try again.',
			toastMessages
		});
	}

	async function handleDelete({ note }: { note: NoteOrdered }) {
		const result = await runOptimisticUpdate({
			apply: () => boardState.deleteNoteById(note.id),
			request: () =>
				tryFetch(`/api/notes/${note.id}`, { method: 'DELETE' }, { shouldParse: false }),
			revert: ([deletedNote, index]) => boardState.createNoteAtIndex(index, deletedNote),
			errorMessage: 'Failed to delete note. Try again.',
			toastMessages
		});
		if (result.type !== 'error') {
			pushState(`/my/board`, { selectedNoteId: null });
		}
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
			toastMessages
		});
	}
</script>

<svelte:head>
	<title>My board with some notes on it</title>
	<meta name="description" content="My personal note board" />
</svelte:head>

{#if loading}
	<NoteList>
		<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
		{#each Array.from({ length: numberOfSkeletons }) as _}
			<NoteContainer>
				<Skeleton />
			</NoteContainer>
		{/each}
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
		onupdatenote={handleUpdate}
		ondeletenote={handleDelete}
		onreorder={handleReorder}
		ontogglefriend={handleToggleFriendShare}
	/>
{/if}
