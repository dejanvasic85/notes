<script lang="ts">
	import partition from 'lodash/partition';

	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import Board from '$components/Board.svelte';
	import { generateId } from '$lib/identityGenerator';
	import { reorderNotes } from '$lib/notes';
	import type { Note } from '$lib/types';

	import { localBoard, orderedNotes } from './noteStore';

	onMount(() => {
		const id = generateId('nid');
		localBoard.update(() => ({
			id: generateId('bid'),
			userId: '',
			noteOrder: [id],
			notes: [
				{
					id,
					text: 'Use the force and edit me by clicking here.',
					textPlain: 'Use the force and edit me by clicking here.',
					boardId: $localBoard.id!,
					colour: null
				}
			]
		}));
	});

	function handleCreateNote() {
		const id = generateId('nid');
		localBoard.update((current) => {
			return {
				...current,
				noteOrder: [...current.noteOrder, id],
				notes: [
					...current.notes,
					{ id, text: `New note`, textPlain: `New note`, boardId: $localBoard.id!, colour: null }
				]
			};
		});
	}

	function handleUpdateNote({ detail: { note } }: CustomEvent<{ note: Note }>) {
		localBoard.update((state) => {
			const [[noteToUpdate], rest] = partition(state.notes, (n) => n.id === note.id);
			return {
				...state,
				noteOrder: [...state.noteOrder],
				notes: [...rest, { ...noteToUpdate, text: note.text }]
			};
		});

		handleClose();
	}

	function handleDeleteNote({ detail }: CustomEvent<{ note: Note }>) {
		localBoard.update((state) => {
			return {
				...state,
				noteOrder: [...state.noteOrder.filter((id) => id !== detail.note.id)],
				notes: [...state.notes.filter((n) => n.id !== detail.note.id)]
			};
		});
		handleClose();
	}

	function handleClose() {
		goto('/playground');
	}

	function handleSelect({ detail: { id } }: CustomEvent<{ id: string }>) {
		goto(`/playground?id=${id}`);
	}

	function handleReorder({
		detail: { fromIndex, toIndex }
	}: CustomEvent<{ fromIndex: number; toIndex: number }>) {
		localBoard.update((state) => {
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
