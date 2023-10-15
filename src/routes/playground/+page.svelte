<script lang="ts">
	import partition from 'lodash/partition';

	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { reorderNotes } from '$lib/notes';

	import Board from '../../components/Board.svelte';
	import type { Note } from '../../types';

	import { localNotes, orderedNotes } from './noteStore';

	onMount(() => {
		const id = crypto.randomUUID();
		localNotes.update(() => ({
			noteOrder: [id],
			notes: [
				{
					id,
					text: 'Use the force and edit me by clicking here.'
				}
			]
		}));
	});

	function handleCreateNote() {
		const id = crypto.randomUUID();
		localNotes.update((current) => {
			return {
				...current,
				noteOrder: [...current.noteOrder, id],
				notes: [...current.notes, { id, text: `New note` }]
			};
		});
	}

	function handleUpdateNote({ detail: { note } }: CustomEvent<{ note: Note }>) {
		localNotes.update((state) => {
			const [[noteToUpdate], rest] = partition(state.notes, (n) => n.id === note.id);
			return {
				noteOrder: [...state.noteOrder],
				notes: [...rest, { ...noteToUpdate, text: note.text }]
			};
		});

		handleClose();
	}

	function handleDeleteNote({ detail }: CustomEvent<{ note: Note }>) {
		localNotes.update((state) => {
			return {
				noteOrder: [...state.noteOrder.filter((id) => id !== detail.note.id)],
				notes: [...state.notes.filter((n) => n.id !== detail.note.id)]
			};
		});
		handleClose();
	}

	function handleClose() {
		goto('/playground');
	}

	function handleSelect({ detail: id }: CustomEvent<string>) {
		goto(`/playground?id=${id}`);
	}

	function handleReorder({
		detail: { fromIndex, toIndex }
	}: CustomEvent<{ fromIndex: number; toIndex: number }>) {
		localNotes.update((state) => {
			const newOrder = reorderNotes(state.noteOrder, fromIndex, toIndex);
			return {
				...state,
				noteOrder: newOrder
			};
		});
	}

	$: search = new URL($page.url).searchParams;
	$: selectedId = search.get('id');
	$: selectedNote = $orderedNotes.find((n) => n.id === selectedId);
</script>

<svelte:head>
	<title>Playground</title>
	<meta name="description" content="Playground is the best place to try out creating some notes" />
</svelte:head>

<Board
	notes={$orderedNotes}
	{selectedNote}
	on:createNote={handleCreateNote}
	on:cancelUpdate={handleClose}
	on:deleteNote={handleDeleteNote}
	on:reorder={handleReorder}
	on:select={handleSelect}
	on:updateNote={handleUpdateNote}
/>
