<script lang="ts">
	import { withAuth } from '$lib/auth';

	import Board from '../../components/Board.svelte';
	import type { Note } from '../../types';

	const auth = withAuth();
	const { getToken } = auth;

	export const load = async () => {
		const token = await getToken();
		const resp = await fetch('/api/board', {
			headers: { Authorization: `Bearer ${token}` }
		});
		const { notes }: { notes: Note[] } = await resp.json();
		return { props: { notes } };
	};

	$: selectedNote = undefined;
</script>

<svelte:head>
	<title>My notes board</title>
	<meta name="description" content="Playground is the best place to try out creating some notes" />
</svelte:head>

{#await load()}
	<div>Loading ... please wait</div>
{:then { props }}
	<Board notes={props.notes} {selectedNote} />
{/await}
