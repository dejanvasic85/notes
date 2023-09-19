<script lang="ts">
	import { withAuth } from '$lib/auth';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { nanoid } from 'nanoid';

	import Board from '../../components/Board.svelte';
	import type { Note } from '../../types';
	import { onMount } from 'svelte';

	const auth = withAuth();
	const { getToken } = auth;
	let localNotes: Note[] = [];
	let loading: boolean = true;

	onMount(() => {
		const loadNotes = async () => {
			const token = await getToken();
			const resp = await fetch('/api/board', {
				headers: { Authorization: `Bearer ${token}` }
			});
			const { notes }: { notes: Note[] } = await resp.json();
			localNotes = [...notes];
			loading = false;
		};

		loadNotes();
	});

	function handleSelect({ detail: id }: CustomEvent<string>) {
		goto(`/board?id=${id}`);
	}

	async function handleCreate() {
		const token = await getToken();
		const resp = await fetch('/api/notes', {
			headers: { Authorization: `Bearer ${token}` },
			method: 'POST',
			body: JSON.stringify({ id: nanoid(8), text: '', colour: null })
		});

		if (resp.ok) {
			const noteResp: { note: Note } = await resp.json();
			// add to local notes
			localNotes = [...localNotes, noteResp.note];
			goto(`/board?id=${noteResp.note.id}`);
		}
	}

	function handleClose() {
		goto('/board');
	}

	async function handleUpdate({ detail }: CustomEvent<Note>) {
		const token = await getToken();
		await fetch(`/api/notes/${detail.id}`, {
			headers: { Authorization: `Bearer ${token}` },
			method: 'PATCH',
			body: JSON.stringify(detail)
		});

		localNotes = [
			...localNotes.map((n) => {
				if (n.id === detail.id) {
					return { ...n, ...detail };
				}
				return n;
			})
		];
		handleClose();
	}

	function handleUpdateColour() {}

	async function handleDeleteNote({ detail }: CustomEvent<{ note: Note }>) {
		const { note } = detail;
		const token = await getToken();
		await fetch(`/api/notes/${note.id}`, {
			headers: { Authorization: `Bearer ${token}` },
			method: 'DELETE'
		});

		localNotes = [...localNotes.filter((n) => n.id !== detail.note.id)];
		handleClose();
	}

	$: search = new URL($page.url).searchParams;
	$: selectedId = search.get('id');
	$: selectedNote = localNotes.find((n) => n.id === selectedId);
</script>

<svelte:head>
	<title>My board with some notes on it</title>
	<meta name="description" content="My personal whiteboard with secure post-it notes" />
</svelte:head>

{#if loading}
	<div>Loading ... please wait</div>
{:else}
	<Board
		notes={localNotes}
		on:createNote={handleCreate}
		on:cancelUpdate={handleClose}
		on:select={handleSelect}
		on:updateNote={handleUpdate}
		on:updateColour={handleUpdateColour}
		on:deleteNote={handleDeleteNote}
		{selectedNote}
	/>
{/if}
