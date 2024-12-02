<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	import { dropzone, type DraggableData } from '$lib/draggable';
	import { searchNotes } from '$lib/notes';
	import type { Friend, NoteOrdered, SharedNote } from '$lib/types';

	import Note from './Note.svelte';
	import NoteEditor from './NoteEditor.svelte';
	import NoteViewer from './NoteViewer.svelte';

	interface UpdateProps {
		note: NoteOrdered;
	}

	// Props
	export let notes: NoteOrdered[];
	export let selectedNote: NoteOrdered | undefined | null;
	export let selectedSharedNote: SharedNote | undefined | null;
	export let enableSharing: boolean = false;
	export let friends: Friend[] = [];
	export let sharedNotes: SharedNote[] = [];

	let searchQuery: string;

	// Events
	type ComponentEvents = {
		updateNote: UpdateProps;
		closeNote: {};
		select: { id: string };
		reorder: { fromIndex: number; toIndex: number };
	};
	const dispatch = createEventDispatcher<ComponentEvents>();

	function handleModalClose() {
		dispatch('closeNote', {});
	}

	function handleSave({ detail: { note } }: CustomEvent<{ note: NoteOrdered }>) {
		dispatch('updateNote', { note });
		dispatch('closeNote', {});
	}

	function handleUpdateColour({ detail: { note } }: CustomEvent<{ note: NoteOrdered }>) {
		dispatch('updateNote', { note });
	}

	function handleEdit(id?: string) {
		if (id) {
			dispatch('select', { id });
		}
	}

	function handleSharedNoteSelected(id?: string) {
		if (id) {
			dispatch('select', { id });
		}
	}

	function handleDrop(toIndex: number, { index }: DraggableData) {
		dispatch('reorder', { fromIndex: index, toIndex });
	}

	$: selectedId = selectedNote?.id;
	$: selectedSharedNoteId = selectedSharedNote?.id;
	$: showModal = !!selectedId || !!selectedSharedNoteId;
	$: notesOrderedFiltered = searchNotes(notes, searchQuery);
	$: selectedNoteFriends = friends.map((f) => {
		const editor = selectedNote?.editors?.find((e) => e.userId === f.id);
		return {
			noteEditorId: editor?.id,
			selected: editor?.selected || false,
			email: f.email,
			id: f.id,
			name: f.name,
			picture: f.picture
		};
	});
</script>

{#if selectedNote}
	<NoteEditor
		bind:showModal
		{enableSharing}
		note={selectedNote}
		friends={selectedNoteFriends}
		on:close={handleModalClose}
		on:deleteNote
		on:toggleFriendShare
		on:saveNote={handleSave}
		on:updateColour={handleUpdateColour}
	/>
{/if}

{#if selectedSharedNote}
	<NoteViewer
		bind:showModal
		noteHtmlText={selectedSharedNote.text}
		noteColour={selectedSharedNote.colour}
		on:close={handleModalClose}
	/>
{/if}

<div class="flex flex-wrap items-stretch gap-2 p-8">
	{#each notesOrderedFiltered as note, index}
		<div
			class="dropzone block h-4 w-full md:h-48 md:w-4"
			use:dropzone={{ onDropped: (args) => handleDrop(index, args) }}
		></div>
		<Note {note} {index} isDraggable={true} on:click={() => handleEdit(note.id)} />
	{/each}
</div>

{#if sharedNotes.length > 0}
	<div class="mt-8 pl-10">
		<h1 class="text-2xl">Shared notes</h1>
	</div>
	<div class="flex flex-wrap items-stretch gap-6 p-8">
		{#each sharedNotes as sharedNote, index}
			<Note
				note={sharedNote}
				{index}
				isDraggable={false}
				on:click={() => handleSharedNoteSelected(sharedNote.id)}
			/>
		{/each}
	</div>
{/if}

<style type="text/postcss">
	.dropzone {
		content: '';
	}

	:global(.droppable) {
		@apply rounded-md bg-pink-500;
	}
</style>
