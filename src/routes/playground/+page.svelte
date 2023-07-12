<script>
	import Board from '../../components/Board.svelte';
	import Note from '../../components/Note.svelte';

	$: notes = [
		{
			text: `hello world`
		}
	];

	function handleCreateNote() {
		console.log('cmon');
		notes = [...notes, { text: 'hello world' }];
	}
</script>

<svelte:head>
	<title>Playground</title>
	<meta name="description" content="Playground is the best place to try out creating some notes" />
</svelte:head>

<Board on:createNote={handleCreateNote}>
	{#each notes as note}
		<Note text={note.text} />
	{/each}
</Board>
