<script lang="ts">
	import { onMount } from 'svelte';
	import { nanoid } from 'nanoid';
	import partition from 'lodash/partition';

	import Board from '../../components/Board.svelte';
	import { localNotes } from './noteStore';
	import type { NoteType } from '../../types';

	onMount(() => {
		localNotes.update(() => [
			{
				id: nanoid(),
				sequence: 0,
				text: 'Hello world!. <p><em>Use the force and edit me by clicking here.</em></p>'
			}
		]);
	});

	const handleCreateNote = () => {
		const length = $localNotes.length;
		localNotes.update((current) => [
			...current,
			{ id: nanoid(), sequence: length, text: `hello world ${length}` }
		]);
	};

	const handleUpdateNote = ({ detail }: CustomEvent<NoteType>) => {
		localNotes.update((state) => {
			const [[noteToUpdate], rest] = partition(state, (n) => n.id === detail.id);
			return [...rest, { ...noteToUpdate, text: detail.text }];
		});
	};
</script>

<svelte:head>
	<title>Playground</title>
	<meta name="description" content="Playground is the best place to try out creating some notes" />
</svelte:head>

<Board notes={$localNotes} on:createNote={handleCreateNote} on:updateNote={handleUpdateNote} />
