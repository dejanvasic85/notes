<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	import type { Note } from '$lib/types';
	import { getOrderedNotes } from '$lib/notes.js';
	import { generateId } from '$lib/identityGenerator.js';

	import Board from '$components/Board.svelte';
	import { tryFetch, MaybeType } from '$lib/fetch.js';

	export let data;
	const boardId = data.board.id;
	let localNoteOrder = [...data.board.noteOrder];
	let localNotes = [...getOrderedNotes(data.board.noteOrder, data.board.notes)];

	$: search = new URL($page.url).searchParams;
	$: selectedId = search.get('id');
	$: selectedNote = localNotes.find((n) => n.id === selectedId);

	function handleSelect({ detail: id }: CustomEvent<string>) {
		goto(`/my/board?id=${id}`);
	}

	function handleClose() {
		goto('/my/board');
	}

	async function handleCreate() {
		const id = generateId('nid');
		const newNote: Note = { id, text: '', textPlain: '', boardId, colour: null };
		localNotes = [...localNotes, { ...newNote, order: localNotes.length }];
		localNoteOrder = [...localNoteOrder, id];

		goto(`/my/board?id=${id}`);

		const resp = await tryFetch<Note>('/api/notes', {
			method: 'POST',
			body: JSON.stringify(newNote)
		});

		if (resp.type === MaybeType.Error) {
			localNotes = [...localNotes.filter((n) => n.id !== id)];
			goto('/my/board');

			// todo: show an error
		}
	}
</script>

<svelte:head>
	<title>My board with some notes on it</title>
	<meta name="description" content="My personal whiteboard with secure notes" />
</svelte:head>

<Board
	notes={localNotes}
	on:select={handleSelect}
	on:closeNote={handleClose}
	on:createNote={handleCreate}
	enableSharing={true}
	{selectedNote}
/>
