<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { nanoid } from 'nanoid';
	import partition from 'lodash/partition';

	import Board from '../../components/Board.svelte';
	import { localNotes } from './noteStore';
	import type { NoteType } from '../../types';
	import { goto } from '$app/navigation';

	onMount(() => {
		localNotes.update(() => [
			{
				id: nanoid(),
				sequence: 0,
				text: 'Hello world!. <p><em>Use the force and edit me by clicking here.</em></p>'
			}
		]);
	});

	function handleCreateNote() {
		const length = $localNotes.length;
		localNotes.update((current) => [
			...current,
			{ id: nanoid(), sequence: length, text: `hello world ${length}` }
		]);
	}

	function handleUpdateNote({ detail }: CustomEvent<NoteType>) {
		localNotes.update((state) => {
			const [[noteToUpdate], rest] = partition(state, (n) => n.id === detail.id);
			return [...rest, { ...noteToUpdate, text: detail.text }];
		});
		handleClose();
	}

	function handleClose() {
		goto('/playground');
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
	on:updateNote={handleUpdateNote}
/>
