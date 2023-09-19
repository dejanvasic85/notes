<script lang="ts">
	import partition from 'lodash/partition';

	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	import Board from '../../components/Board.svelte';
	import { localNotes } from './noteStore';
	import type { Note } from '../../types';

	onMount(() => {
		localNotes.update(() => [
			{
				id: crypto.randomUUID(),
				text: 'Use the force and edit me by clicking here.'
			}
		]);
	});

	function handleCreateNote() {
		localNotes.update((current) => [...current, { id: crypto.randomUUID(), text: `New note` }]);
	}

	function handleUpdateNote({ detail }: CustomEvent<Note>) {
		localNotes.update((state) => {
			const [[noteToUpdate], rest] = partition(state, (n) => n.id === detail.id);
			return [...rest, { ...noteToUpdate, text: detail.text }];
		});
		handleClose();
	}

	function handleUpdateColour({ detail }: CustomEvent<{ note: Note }>) {
		localNotes.update((state) => {
			const [[noteToUpdate], rest] = partition(state, (n) => n.id === detail.note.id);
			return [...rest, { ...noteToUpdate, colour: detail.note.colour }];
		});
	}

	function handleDeleteNote({ detail }: CustomEvent<{ note: Note }>) {
		localNotes.update((state) => {
			return [...state.filter((n) => n.id !== detail.note.id)];
		});
		handleClose();
	}

	function handleClose() {
		goto('/playground');
	}

	function handleSelect({ detail: id }: CustomEvent<string>) {
		goto(`/playground?id=${id}`);
	}

	$: search = new URL($page.url).searchParams;
	$: selectedId = search.get('id');
	$: selectedNote = $localNotes.find((n) => n.id === selectedId);
</script>

<svelte:head>
	<title>Playground</title>
	<meta name="description" content="Playground is the best place to try out creating some notes" />
</svelte:head>

<Board
	notes={$localNotes}
	{selectedNote}
	on:createNote={handleCreateNote}
	on:cancelUpdate={handleClose}
	on:select={handleSelect}
	on:updateNote={handleUpdateNote}
	on:updateColour={handleUpdateColour}
	on:deleteNote={handleDeleteNote}
/>
