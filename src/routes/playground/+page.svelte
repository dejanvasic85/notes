<script>
	import Board from '../../components/Board.svelte';
	import Note from '../../components/Note.svelte';

	const notes = [
		{
			text: `hello world`
		}
	];
</script>

<Board>
	{#each notes as note}
		<Note text={note.text} />
	{/each}
</Board>
