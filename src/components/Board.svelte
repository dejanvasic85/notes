<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	import { dropzone, type DraggableData } from '$lib/draggable';
	import type { Note as NoteType } from '../types';

	import Button from './Button.svelte';
	import Icon from './Icon.svelte';
	import Note from './Note.svelte';
	import NoteEditor from './NoteEditor.svelte';

	interface UpdateProps {
		note: NoteType;
	}

	// Props
	export let notes: NoteType[];
	export let selectedNote: NoteType | undefined;

	// Events
	const dispatchCreate = createEventDispatcher();
	const dispatchUpdate = createEventDispatcher<{ updateNote: UpdateProps }>();
	const dispatchClose = createEventDispatcher();
	const dispatchSelect = createEventDispatcher<{ select: string }>();

	function handleModalClose() {
		dispatchClose('closeNote');
	}

	function handleSave({ detail: { note } }: CustomEvent<{ note: NoteType }>) {
		dispatchUpdate('updateNote', { note });
		dispatchClose('closeNote');
	}

	function handleUpdateColour({ detail: { note } }: CustomEvent<{ note: NoteType }>) {
		dispatchUpdate('updateNote', { note });
	}

	function handleCreateClick() {
		dispatchCreate('createNote');
	}

	function handleEdit(id: string) {
		dispatchSelect('select', id);
	}

	function handleDrop(targetIndex: number, { index, note }: DraggableData, event: DragEvent) {
		console.log('args', targetIndex, index, note, event);
	}

	$: selectedId = selectedNote?.id;
	$: showModal = !!selectedId;
</script>

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
	{#each notes as note, index}
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
		@apply rounded-md bg-slate-600;
	}
</style>
