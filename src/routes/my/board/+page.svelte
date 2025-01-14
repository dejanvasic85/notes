<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount } from 'svelte';

	import type { Note, NoteOrdered, SharedNote, ToggleFriendShare } from '$lib/types';
	import { tryFetch } from '$lib/browserFetch';
	import { getBoardState } from '$lib/state/boardState.svelte';
	import { getToastMessages } from '$lib/state/toastMessages.svelte';

	import Board from '$components/Board.svelte';
	import Button from '$components/Button.svelte';
	import NoteList from '$components/NoteList.svelte';
	import NoteContainer from '$components/NoteContainer.svelte';
	import Skeleton from '$components/Skeleton.svelte';

	const numberOfSkeletons = 4;
	const boardState = getBoardState();
	const toastMessages = getToastMessages();

	let { data } = $props();
	let selectedNote: NoteOrdered | null = $state(null);
	let selectedSharedNote: SharedNote | null = $state(null);

	let search = $derived(new URL(page.url).searchParams);
	let selectedId = $derived(search.get('id'));

	onMount(() => {
		data.boardPromise.then((data) => {
			boardState.setBoard(data.board, data.friends, data.sharedNotes);
		});
	});

	$effect(() => {
		selectedNote = selectedId ? boardState.notes.find((n) => n.id === selectedId) || null : null;
		selectedSharedNote = selectedId
			? boardState.sharedNotes.find((n) => n.id === selectedId) || null
			: null;
	});

	function handleSelect({ id }: { id: string }) {
		goto(`/my/board?id=${id}`);
	}

	function handleClose() {
		goto('/my/board');
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
		const [updatedNote, original] = boardState.updateNote(note);
		const { type } = await tryFetch<Note>(`/api/notes/${note.id}`, {
			method: 'PATCH',
			body: JSON.stringify(updatedNote)
		});
		if (type === 'error') {
			boardState.updateNote(original);
			toastMessages.addMessage({ message: 'Failed to update note. Try again.', type: 'error' });
		}
	}

	async function handleDelete({ note }: { note: NoteOrdered }) {
		const [deletedNote, index] = boardState.deleteNoteById(note.id);
		const resp = await tryFetch(
			`/api/notes/${note.id}`,
			{ method: 'DELETE' },
			{ shouldParse: false }
		);
		if (resp.type === 'error') {
			boardState.createNoteAtIndex(index, deletedNote);
			toastMessages.addMessage({ message: 'Failed to delete note. Try again.', type: 'error' });
		} else {
			goto('/my/board');
		}
	}

	async function handleReorder({ fromIndex, toIndex }: { fromIndex: number; toIndex: number }) {
		const [noteOrder] = boardState.reorderNotes(fromIndex, toIndex);
		const boardPatch = { noteOrder };
		const result = await tryFetch<Board>(`/api/board/${boardState.boardId}`, {
			method: 'PATCH',
			body: JSON.stringify(boardPatch)
		});
		if (result.type === 'error') {
			boardState.reorderNotes(toIndex, fromIndex);
			toastMessages.addMessage({ message: 'Failed to reorder notes. Try again.', type: 'error' });
		}
	}
</script>

<svelte:head>
	<title>My board with some notes on it</title>
	<meta name="description" content="My personal note board" />
</svelte:head>

<div>
	{#await data.boardPromise}
		<NoteList>
			<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
			{#each Array.from({ length: numberOfSkeletons }) as _}
				<NoteContainer>
					<Skeleton />
				</NoteContainer>
			{/each}
		</NoteList>
	{:then}
		<Board
			{selectedNote}
			{selectedSharedNote}
			friends={boardState.friends}
			notes={boardState.notes}
			enableSharing={true}
			sharedNotes={boardState.sharedNotes}
			onselect={handleSelect}
			onclosenote={handleClose}
			onupdatenote={handleUpdate}
			ondeletenote={handleDelete}
			onreorder={handleReorder}
			ontogglefriend={handleToggleFriendShare}
		/>
	{:catch}
		<p class="text-error" role="alert">There was a problem loading your board</p>
		<Button onclick={() => window.location.reload()}>Retry</Button>
	{/await}
</div>
