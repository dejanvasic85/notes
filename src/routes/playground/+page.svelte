<script>
	import Board from '../../components/Board.svelte';
	import Note from '../../components/Note.svelte';

	$: notes = [
		{
			text: `hello world`
		}
	];

	function handleCreateNote() {
		const length = notes.length;
		notes = [...notes, { text: `hello world ${length}` }];
	}
</script>

<svelte:head>
	<title>Playground</title>
	<meta name="description" content="Playground is the best place to try out creating some notes" />
</svelte:head>

<Board on:createNote={handleCreateNote}>
	{#each notes as note}
		<Note bind:text={note.text} />
	{/each}
</Board>
