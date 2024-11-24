<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	import type { Note, NoteOrdered, NotePatchInput, BoardPatch } from '$lib/types';
	import { getOrderedNotes, updateNote, reorderNotes } from '$lib/notes';
	import { generateId } from '$lib/identityGenerator';
	import { tryFetch, MaybeType } from '$lib/fetch';

	import Board from '$components/Board.svelte';

	export let data;

	const boardId = data.board.id;
	let localNoteOrder = [...data.board.noteOrder];
	let localNotes = [...getOrderedNotes(data.board.noteOrder, data.board.notes)];
	let friends = data.friends;

	$: search = new URL($page.url).searchParams;
	$: selectedId = search.get('id');
	$: selectedNote = localNotes.find((n) => n.id === selectedId);
	$: selectedSharedNote = data.sharedNotes.find((n) => n.id === selectedId);

	function handleSelect({ detail: { id } }: CustomEvent<{ id: string }>) {
		goto(`/my/board?id=${id}`);
	}

	function handleClose() {
		goto('/my/board');
	}

	async function handleCreate() {
		const id = generateId('nid');
		const newNote: Note = { id, text: '', textPlain: '', boardId, colour: null };
		localNotes = [...localNotes, { ...newNote, order: localNotes.length }];
		localNoteOrder = [...localNoteOrder, id];

		goto(`/my/board?id=${id}`);

		const resp = await tryFetch<Note>('/api/notes', {
			method: 'POST',
			body: JSON.stringify(newNote)
		});

		if (resp.type === MaybeType.Error) {
			localNotes = [...localNotes.filter((n) => n.id !== id)];
			goto('/my/board');

			// todo: show an error
		}
	}

	async function handleToggleFriendShare({
		detail: { id, friendUserId, noteId, selected }
	}: CustomEvent<{ id?: string; friendUserId: string; noteId: string; selected: boolean }>) {
		const note = localNotes.find((n) => n.id === noteId);
		const friend = friends.find((f) => f.id === friendUserId);

		if (!note || !friend) {
			console.error('note or friend not found');
			return;
		}

		// Update local state first
		const currentEditors = note.editors ?? [];
		let currentEditor = currentEditors.find((e) => e.id === id);
		if (currentEditor) {
			currentEditor.selected = selected;
			localNotes = [
				...localNotes.filter((n) => n.id !== noteId),
				{
					...note,
					editors: [...currentEditors.filter((e) => e.id !== currentEditor!.id), currentEditor]
				}
			];
		} else {
			const newId = generateId('ned');
			currentEditor = { id: newId, userId: friendUserId, selected, noteId };
			currentEditors.push(currentEditor);
			localNotes = [
				...localNotes.filter((n) => n.id !== noteId),
				{ ...note, editors: currentEditors }
			];
		}

		const resp = await tryFetch(
			`/api/notes/${noteId}/editors`,
			{
				method: 'POST',
				body: JSON.stringify(currentEditor)
			},
			{ shouldParse: false }
		);

		console.log('resp', resp);
	}

	async function handleUpdate({ detail: { note } }: CustomEvent<{ note: NoteOrdered }>) {
		const original = localNotes.find((n) => n.id === note.id);
		if (!original) {
			// todo: show an error
			return;
		}

		localNotes = [...updateNote(localNotes, note)];
		const notePatch: NotePatchInput = {
			colour: note.colour,
			text: note.text,
			textPlain: note.textPlain
		};

		const { type } = await tryFetch<Note>(`/api/notes/${note.id}`, {
			method: 'PATCH',
			body: JSON.stringify(notePatch)
		});

		if (type === MaybeType.Error) {
			// todo: show an error
			localNotes = [...updateNote(localNotes, original)];
		}
	}

	async function handleDelete({ detail }: CustomEvent<{ note: NoteOrdered }>) {
		const { note } = detail;
		localNotes = [...localNotes.filter((n) => n.id !== detail.note.id)];
		localNoteOrder = [...localNoteOrder.filter((id) => id !== detail.note.id)];

		const resp = await tryFetch(
			`/api/notes/${note.id}`,
			{ method: 'DELETE' },
			{ shouldParse: false }
		);

		if (resp.type === MaybeType.Error) {
			localNotes = [...localNotes, note];
			localNoteOrder = [...localNoteOrder, note.id!];
			// todo: show an error
		} else {
			goto('/my/board');
		}
	}

	async function handleReorder({
		detail: { fromIndex, toIndex }
	}: CustomEvent<{ fromIndex: number; toIndex: number }>) {
		const noteOrder = reorderNotes(localNoteOrder, fromIndex, toIndex);
		localNoteOrder = [...noteOrder];
		localNotes = [...getOrderedNotes(noteOrder, localNotes)];
		const boardPatch: BoardPatch = { noteOrder };

		const result = await tryFetch<Board>(`/api/board/${boardId}`, {
			method: 'PATCH',
			body: JSON.stringify(boardPatch)
		});

		if (result.type === MaybeType.Error) {
			// revert the local change
			localNoteOrder = [...reorderNotes(noteOrder, toIndex, fromIndex)];
			localNotes = [...getOrderedNotes(localNoteOrder, localNotes)];
			// todo: show an error
		}
	}

	$: {
		const search = new URL($page.url).searchParams;
		const newNote = search.get('new');
		if (newNote) {
			handleCreate();
		}
	}
</script>

<svelte:head>
	<title>My board with some notes on it</title>
	<meta name="description" content="My personal whiteboard with notes" />
</svelte:head>

<Board
	notes={localNotes}
	enableSharing={true}
	{selectedNote}
	{selectedSharedNote}
	{friends}
	sharedNotes={data.sharedNotes}
	on:select={handleSelect}
	on:closeNote={handleClose}
	on:createNote={handleCreate}
	on:updateNote={handleUpdate}
	on:deleteNote={handleDelete}
	on:reorder={handleReorder}
	on:toggleFriendShare={handleToggleFriendShare}
/>
