<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { untrack } from 'svelte';

	import type {
		Note,
		NoteOrdered,
		NotePatchInput,
		BoardPatch,
		Friend,
		SharedNote,
		ToggleFriendShare
	} from '$lib/types';
	import { getOrderedNotes, updateNote, reorderNotes } from '$lib/notes';
	import { generateId } from '$lib/identityGenerator';
	import { tryFetch, MaybeType } from '$lib/fetch';

	import Board from '$components/Board.svelte';
	import Skeleton from '$components/Skeleton.svelte';
	import Button from '$components/Button.svelte';

	let { data } = $props();
	let boardId: string = $state('');
	let localNoteOrder: string[] = $state([]);
	let localNotes: NoteOrdered[] = $state([]);
	let localSharedNotes: SharedNote[] = $state([]);
	let friends: Friend[] = $state([]);
	let selectedNote: NoteOrdered | null = $state(null);
	let selectedSharedNote: SharedNote | null = $state(null);

	let search = $derived(new URL(page.url).searchParams);
	let selectedId = $derived(search.get('id'));
	let isCreating = $derived(search.get('new'));

	$effect(() => {
		const loadData = async () => {
			const result = await data.boardPromise;
			boardId = result.board.id;
			localNoteOrder = [...result.board.noteOrder];
			localNotes = [...getOrderedNotes(result.board.noteOrder, result.board.notes)];
			localSharedNotes = result.sharedNotes;
			friends = result.friends;
		};

		if (!boardId) {
			loadData();
		}
	});

	$effect(() => {
		selectedNote = selectedId ? localNotes.find((n) => n.id === selectedId) || null : null;
		selectedSharedNote = selectedId
			? localSharedNotes.find((n) => n.id === selectedId) || null
			: null;
	});

	$effect(() => {
		const createNote = async () => {
			const id = await untrack(() => handleCreate());
			goto(`/my/board?id=${id}`);
		};

		if (isCreating) {
			createNote();
		}
	});

	function handleSelect({ id }: { id: string }) {
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

		const resp = await tryFetch<Note>('/api/notes', {
			method: 'POST',
			body: JSON.stringify(newNote)
		});
		if (resp.type === MaybeType.Error) {
			localNotes = [...localNotes.filter((n) => n.id !== id)];
			goto('/my/board');
			// todo: show an error
		}

		return id;
	}

	async function handleToggleFriendShare({
		id,
		friendUserId,
		noteId,
		selected
	}: ToggleFriendShare) {
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

		await tryFetch(
			`/api/notes/${noteId}/editors`,
			{
				method: 'POST',
				body: JSON.stringify(currentEditor)
			},
			{ shouldParse: false }
		);
	}

	async function handleUpdate({ note }: { note: NoteOrdered }) {
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

	async function handleDelete({ note }: { note: NoteOrdered }) {
		localNotes = [...localNotes.filter((n) => n.id !== note.id)];
		localNoteOrder = [...localNoteOrder.filter((id) => id !== note.id)];

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

	async function handleReorder({ fromIndex, toIndex }: { fromIndex: number; toIndex: number }) {
		const noteOrder = reorderNotes(localNoteOrder, fromIndex, toIndex);
		localNoteOrder = [...noteOrder];
		localNotes = [...getOrderedNotes(noteOrder, localNotes)];
		const boardPatch: BoardPatch = { noteOrder };

		const result = await tryFetch<Board>(`/api/board/${boardId}`, {
			method: 'PATCH',
			body: JSON.stringify(boardPatch)
		});

		if (result.type === MaybeType.Error) {
			// revert the local state
			localNoteOrder = [...reorderNotes(noteOrder, toIndex, fromIndex)];
			localNotes = [...getOrderedNotes(localNoteOrder, localNotes)];
			// todo: show an error
		}
	}
</script>

<svelte:head>
	<title>My board with some notes on it</title>
	<meta name="description" content="My personal note board" />
</svelte:head>

<div>
	{#await data.boardPromise}
		<div class="flex flex-col gap-6 lg:flex-row">
			<Skeleton height="h-note" width="w-note" />
			<Skeleton height="h-note" width="w-note" />
			<Skeleton height="h-note" width="w-note" />
		</div>
	{:then}
		<Board
			{selectedNote}
			{selectedSharedNote}
			{friends}
			notes={localNotes}
			enableSharing={true}
			sharedNotes={localSharedNotes}
			onselect={handleSelect}
			onclosenote={handleClose}
			onupdatenote={handleUpdate}
			ondeletenote={handleDelete}
			onreorder={handleReorder}
			ontogglefriend={handleToggleFriendShare}
		/>
	{:catch}
		<p class="text-error" role="alert">There was a problem loading your board</p>
		<Button onclick={() => window.location.reload()}>Retry</Button>
	{/await}
</div>
