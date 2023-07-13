<script lang="ts">
	import { onMount } from 'svelte';
	import Board from '../../components/Board.svelte';
	import Note from '../../components/Note.svelte';
	import { localNotes } from './noteStore';

	onMount(() => {
		if ($localNotes.length === 0) {
			localNotes.update(() => [
				{ text: 'Hello world!. <p><em>Use the force and edit me by clicking here.</em></p>' }
			]);
		}
	});

	function handleCreateNote() {
		const length = $localNotes.length;
		localNotes.update((current) => [...current, { text: `hello world ${length}` }]);
	}
</script>

<svelte:head>
	<title>Playground</title>
	<meta name="description" content="Playground is the best place to try out creating some notes" />
</svelte:head>

<Board on:createNote={handleCreateNote}>
	{#each $localNotes as note}
		<Note bind:text={note.text} />
	{/each}
</Board>
