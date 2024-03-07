<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	import { getOrderedNotes } from '$lib/notes.js';
	import Board from '$components/Board.svelte';

	export let data;
	const localNotes = [...getOrderedNotes(data.board.noteOrder, data.board.notes)];

	$: search = new URL($page.url).searchParams;
	$: selectedId = search.get('id');
	$: selectedNote = localNotes.find((n) => n.id === selectedId);

	function handleSelect({ detail: id }: CustomEvent<string>) {
		goto(`/my/board?id=${id}`);
	}

	function handleClose() {
		goto('/my/board');
	}
</script>

<svelte:head>
	<title>My board with some notes on it</title>
	<meta name="description" content="My personal whiteboard with secure notes" />
</svelte:head>

<Board
	notes={localNotes}
	on:select={handleSelect}
	on:closeNote={handleClose}
	enableSharing={true}
	{selectedNote}
/>
