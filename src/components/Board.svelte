<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	import { dropzone, type DraggableData } from '$lib/draggable';
	import { searchNotes } from '$lib/notes';
	import type { NoteOrdered } from '$lib/types';

	import Button from './Button.svelte';
	import Icon from './Icon.svelte';
	import Note from './Note.svelte';
	import NoteEditor from './NoteEditor.svelte';

	interface UpdateProps {
		note: NoteOrdered;
	}

	// Props
	export let notes: NoteOrdered[];
	export let selectedNote: NoteOrdered | undefined;
	let searchQuery: string;

	// Events
	const dispatchCreate = createEventDispatcher();
	const dispatchUpdate = createEventDispatcher<{ updateNote: UpdateProps }>();
	const dispatchClose = createEventDispatcher();
	const dispatchSelect = createEventDispatcher<{ select: string }>();
	const dispatchReorder = createEventDispatcher<{
		reorder: { fromIndex: number; toIndex: number };
	}>();

	function handleModalClose() {
		dispatchClose('closeNote');
	}

	function handleSave({ detail: { note } }: CustomEvent<{ note: NoteOrdered }>) {
		dispatchUpdate('updateNote', { note });
		dispatchClose('closeNote');
	}

	function handleUpdateColour({ detail: { note } }: CustomEvent<{ note: NoteOrdered }>) {
		dispatchUpdate('updateNote', { note });
	}

	function handleCreateClick() {
		dispatchCreate('createNote');
	}

	function handleEdit(id?: string) {
		if (id) {
			dispatchSelect('select', id);
		}
	}

	function handleDrop(toIndex: number, { index }: DraggableData, _: DragEvent) {
		dispatchReorder('reorder', { fromIndex: index, toIndex });
	}

	$: selectedId = selectedNote?.id;
	$: showModal = !!selectedId;
	$: notesOrderedFiltered = searchNotes(notes, searchQuery);
</script>

<input
	type="search"
	placeholder="Search notes"
	bind:value={searchQuery}
	class="mx-auto block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 md:w-1/2"
/>

{#if selectedNote}
	<NoteEditor
		bind:showModal
		note={selectedNote}
		on:close={handleModalClose}
		on:saveNote={handleSave}
		on:deleteNote
		on:updateColour={handleUpdateColour}
	/>
{/if}

<div class="flex flex-wrap items-stretch justify-center gap-2 p-8">
	{#each notesOrderedFiltered as note, index}
		<div
			class="dropzone block h-4 w-full md:h-48 md:w-4"
			use:dropzone={{ onDropped: (args, evt) => handleDrop(index, args, evt) }}
		></div>
		<Note {note} {index} on:click={() => handleEdit(note.id)} />
	{/each}
	<div class="fixed bottom-0 w-full focus:outline-none">
		<div class="float-right mx-5 my-5">
			<Button on:click={handleCreateClick} rounded>
				<Icon icon="plus" size={48} title="Add note" />
			</Button>
		</div>
	</div>
</div>

<style type="text/postcss">
	.dropzone {
		content: '';
	}

	:global(.droppable) {
		@apply rounded-md bg-pink-500;
	}
</style>
