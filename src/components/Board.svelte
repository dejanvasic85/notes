<script lang="ts">
	import { dropzone, type DraggableData } from '$lib/draggable';
	import type { Friend, NoteOrdered, SharedNote, ToggleFriendShare } from '$lib/types';

	import Note from './Note.svelte';
	import NoteEditor from './NoteEditor.svelte';
	import NoteViewer from './NoteViewer.svelte';

	type Props = {
		notes: NoteOrdered[];
		selectedNote?: NoteOrdered | null;
		selectedSharedNote?: SharedNote | null;
		enableSharing?: boolean;
		friends?: Friend[];
		sharedNotes?: SharedNote[];
		onclosenote: () => void;
		onupdatenote: (params: { note: NoteOrdered }) => void;
		onselect: (params: { id: string }) => void;
		onreorder: (params: { fromIndex: number; toIndex: number }) => void;
		ondeletenote: (params: { note: NoteOrdered }) => void;
		ontogglefriend?: (params: ToggleFriendShare) => void;
	};

	let {
		notes,
		selectedNote,
		selectedSharedNote,
		enableSharing = false,
		friends = [],
		sharedNotes = [],
		onupdatenote,
		onclosenote,
		onselect,
		onreorder,
		ondeletenote,
		ontogglefriend
	}: Props = $props();

	function handleModalClose(noteId: string) {
		onclosenote();
		setTimeout(() => {
			const noteElement = document.getElementById(noteId);
			if (noteElement) {
				noteElement.scrollIntoView({ behavior: 'instant', block: 'center' });
				noteElement.focus();
			}
		}, 50);
	}

	function handleSave({ detail: { note } }: CustomEvent<{ note: NoteOrdered }>) {
		onupdatenote({ note });
		handleModalClose(note.id);
	}

	function handleUpdateColour({ detail: { note } }: CustomEvent<{ note: NoteOrdered }>) {
		onupdatenote({ note });
	}

	function handleEdit(id?: string) {
		if (id) {
			onselect({ id });
		}
	}

	function handleSharedNoteSelected(id?: string) {
		if (id) {
			onselect({ id });
		}
	}

	function handleDrop(toIndex: number, { index }: DraggableData) {
		onreorder({ fromIndex: index, toIndex });
	}

	let showModal = $derived(!!selectedNote?.id || !!selectedSharedNote?.id);
	let selectedNoteFriends = $derived(
		friends.map((f) => {
			const editor = selectedNote?.editors?.find((e) => e.userId === f.id);
			return {
				noteEditorId: editor?.id,
				selected: editor?.selected || false,
				email: f.email,
				id: f.id,
				name: f.name,
				picture: f.picture
			};
		})
	);
</script>

{#if selectedNote}
	<NoteEditor
		{showModal}
		{enableSharing}
		note={selectedNote}
		friends={selectedNoteFriends}
		on:close={() => handleModalClose(selectedNote.id)}
		on:deleteNote={({ detail: { note } }) => ondeletenote({ note })}
		on:toggleFriendShare={({ detail: friendShare }) => ontogglefriend?.(friendShare)}
		on:saveNote={handleSave}
		on:updateColour={handleUpdateColour}
	/>
{/if}

{#if selectedSharedNote}
	<NoteViewer
		{showModal}
		noteHtmlText={selectedSharedNote.text}
		noteColour={selectedSharedNote.colour}
		onclose={() => handleModalClose(selectedSharedNote.id)}
	/>
{/if}

<div class="flex flex-wrap items-stretch gap-2">
	{#each notes as note, index}
		<div
			class="dropzone block h-4 w-full md:h-note md:w-4"
			use:dropzone={{ onDropped: (args) => handleDrop(index, args) }}
		></div>
		<Note {note} {index} isDraggable={true} onclick={() => handleEdit(note.id)} />
	{/each}
</div>

{#if sharedNotes.length > 0}
	<div class="mt-8 pl-10">
		<h1 class="text-2xl">Shared notes</h1>
	</div>
	<div class="flex flex-wrap items-stretch gap-6">
		{#each sharedNotes as sharedNote, index}
			<Note
				note={sharedNote}
				{index}
				isDraggable={false}
				onclick={() => handleSharedNoteSelected(sharedNote.id)}
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
