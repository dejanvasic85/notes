<script lang="ts">
	import { nanoid } from 'nanoid';

	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	import { withAuth } from '$lib/auth';
	import { updateNote } from '$lib/notes';
	import { MaybeType, tryFetch } from '$lib/fetch';
	import Board from '../../components/Board.svelte';
	import type { Note } from '../../types';

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
		const id = nanoid(8);
		const newNote: Note = { id, text: '' };
		localNotes = [...localNotes, newNote];

		goto(`/board?id=${id}`);

		const token = await getToken();
		const resp = await tryFetch('/api/notes', {
			headers: { Authorization: `Bearer ${token}` },
			method: 'POST',
			body: JSON.stringify(newNote)
		});

		if (resp.type === MaybeType.Error) {
			localNotes = [...localNotes.filter((n) => n.id !== id)];
			goto('/board');

			// todo: show an error
		}
	}

	function handleClose() {
		goto('/board');
	}

	async function handleUpdate({ detail: { note } }: CustomEvent<{ note: Note }>) {
		const original = localNotes.find((n) => n.id === note.id);
		if (!original) {
			// todo: show an error
			return;
		}

		localNotes = [...updateNote(localNotes, note)];
		const token = await getToken();

		const { type } = await tryFetch(`/api/notes/${note.id}`, {
			headers: { Authorization: `Bearer ${token}` },
			method: 'PATCH',
			body: JSON.stringify(note)
		});

		if (type === MaybeType.Error) {
			// todo: show an error
			localNotes = [...updateNote(localNotes, original)];
		}
	}

	async function handleDeleteNote({ detail }: CustomEvent<{ note: Note }>) {
		const { note } = detail;
		localNotes = [...localNotes.filter((n) => n.id !== detail.note.id)];

		const token = await getToken();
		const { type } = await tryFetch(`/api/notes/${note.id}`, {
			headers: { Authorization: `Bearer ${token}` },
			method: 'DELETE'
		});

		if (type === MaybeType.Error) {
			localNotes = [...localNotes, note];
			// todo: show an error
		}
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
		on:closeNote={handleClose}
		on:select={handleSelect}
		on:updateNote={handleUpdate}
		on:deleteNote={handleDeleteNote}
		{selectedNote}
	/>
{/if}
