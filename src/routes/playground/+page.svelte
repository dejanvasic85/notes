<script lang="ts">
	import { onMount } from 'svelte';
	import { nanoid } from 'nanoid';

	import Board from '../../components/Board.svelte';
	import { localNotes } from './noteStore';

	onMount(() => {
		if ($localNotes.length === 0) {
			localNotes.update(() => [
				{
					text: 'Hello world!. <p><em>Use the force and edit me by clicking here.</em></p>',
					id: nanoid()
				}
			]);
		}
	});

	function handleCreateNote() {
		const length = $localNotes.length;
		localNotes.update((current) => [...current, { text: `hello world ${length}`, id: nanoid() }]);
	}
</script>

<svelte:head>
	<title>Playground</title>
	<meta name="description" content="Playground is the best place to try out creating some notes" />
</svelte:head>

<Board notes={$localNotes} on:createNote={handleCreateNote} />
