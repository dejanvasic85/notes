<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	import Board from '$components/Board.svelte';
	import { withAuth } from '$lib/auth';
	import { getOrderedNotes, reorderNotes, updateNote } from '$lib/notes';
	import { MaybeType, tryFetch } from '$lib/fetch';
	import type { Note, NoteOrdered, User } from '$lib/types';
	import { generateId } from '$lib/identityGenerator';

	const auth = withAuth();
	const { getToken } = auth;
	let localNotes: NoteOrdered[] = [];
	let localNoteOrder: string[] = [];
	let boardId: string;
	let loading: boolean = true;

	onMount(() => {
		const loadNotes = async () => {
			const resp = await tryFetch<User>('/api/user', {}, { getBearerToken: getToken });
			if (resp.type === MaybeType.Error) {
				// todo: show an error
			} else {
				const { value: user } = resp;
				// At the moment only a single board per user...
				const [{ id, noteOrder, notes }] = user.boards;
				boardId = id!;
				localNotes = getOrderedNotes(noteOrder, notes);
				localNoteOrder = noteOrder;
				loading = false;
			}
		};

		loadNotes();
	});

	function handleSelect({ detail: id }: CustomEvent<string>) {
		goto(`/my-board?id=${id}`);
	}

	async function handleCreate() {
		const id = generateId('nid');
		const newNote: Note = { id, text: '', textPlain: '', boardId, colour: null };
		localNotes = [...localNotes, { ...newNote, order: localNotes.length }];
		localNoteOrder = [...localNoteOrder, id];

		goto(`/my-board?id=${id}`);

		const resp = await tryFetch<Note>(
			'/api/notes',
			{ method: 'POST', body: JSON.stringify(newNote) },
			{ getBearerToken: getToken }
		);

		if (resp.type === MaybeType.Error) {
			localNotes = [...localNotes.filter((n) => n.id !== id)];
			goto('/my-board');

			// todo: show an error
		}
	}

	function handleClose() {
		goto('/my-board');
	}

	async function handleUpdate({ detail: { note } }: CustomEvent<{ note: NoteOrdered }>) {
		const original = localNotes.find((n) => n.id === note.id);
		if (!original) {
			// todo: show an error
			return;
		}

		localNotes = [...updateNote(localNotes, note)];
		const { order, boardId, ...restNoteProps } = note;

		const { type } = await tryFetch<Note>(
			`/api/notes/${note.id}`,
			{ method: 'PATCH', body: JSON.stringify(restNoteProps) },
			{ getBearerToken: getToken }
		);

		if (type === MaybeType.Error) {
			// todo: show an error
			localNotes = [...updateNote(localNotes, original)];
		}
	}

	async function handleDeleteNote({ detail }: CustomEvent<{ note: NoteOrdered }>) {
		const { note } = detail;
		localNotes = [...localNotes.filter((n) => n.id !== detail.note.id)];
		localNoteOrder = [...localNoteOrder.filter((id) => id !== detail.note.id)];

		const resp = await tryFetch(
			`/api/notes/${note.id}`,
			{ method: 'DELETE' },
			{ getBearerToken: getToken, shouldParse: false }
		);

		if (resp.type === MaybeType.Error) {
			localNotes = [...localNotes, note];
			localNoteOrder = [...localNoteOrder, note.id!];
			// todo: show an error
		} else {
			goto('/my-board');
		}
	}

	async function handleReorder({
		detail: { fromIndex, toIndex }
	}: CustomEvent<{ fromIndex: number; toIndex: number }>) {
		const noteOrder = reorderNotes(localNoteOrder, fromIndex, toIndex);
		localNoteOrder = [...noteOrder];
		localNotes = [...getOrderedNotes(noteOrder, localNotes)];

		const result = await tryFetch<Board>(
			`/api/my-board/${boardId}`,
			{ method: 'PATCH', body: JSON.stringify({ noteOrder }) },
			{ getBearerToken: getToken }
		);

		if (result.type === MaybeType.Error) {
			// revert the local change
			localNoteOrder = [...reorderNotes(noteOrder, toIndex, fromIndex)];
			localNotes = [...getOrderedNotes(localNoteOrder, localNotes)];
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
		on:reorder={handleReorder}
		{selectedNote}
	/>
{/if}
