<script lang="ts">
	import Board from '../../components/Board.svelte';
	import Note from '../../components/Note.svelte';
	import { localNotes } from './noteStore';

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
