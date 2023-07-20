<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	import type { NoteType } from '../types';

	import Button from './Button.svelte';
	import Modal from './Modal.svelte';
	import Note from './Note.svelte';

	// Props
	export let notes: NoteType[];
	export let selectedNote: NoteType | undefined;

	let currentNoteText: string = selectedNote?.text ?? '';
	let editor: HTMLDivElement;

	// Events
	const dispatchCreate = createEventDispatcher();
	const dispatchUpdate = createEventDispatcher<{ updateNote: NoteType }>();
	const dispatchCancelUpdate = createEventDispatcher();
	const dispatchSelect = createEventDispatcher<{ select: string }>();

	function handleClose() {
		dispatchCancelUpdate('cancelUpdate');
	}

	function handleSave() {
		if (!selectedNote) {
			return;
		}
		dispatchUpdate('updateNote', { ...selectedNote, text: currentNoteText });
	}

	function handleCreateClick() {
		dispatchCreate('createNote');
	}

	function handleEdit(id: string) {
		dispatchSelect('select', id);
	}

	function handleChange() {
		currentNoteText = editor.innerHTML;
	}

	let isControlDown = false;
	function handleKeydown(event: KeyboardEvent) {
		if (event.repeat) {
			return;
		}

		if (event.key === 'Control') {
			isControlDown = true;
			event.preventDefault();
		}

		if (event.key === 'Enter' && isControlDown) {
			handleSave();
		}
	}

	$: orderedNotes = notes.sort((a, b) => a.sequence - b.sequence);
	$: selectedNoteText = selectedNote?.text ?? '';
	$: selectedId = selectedNote?.id;
	$: showModal = !!selectedId;
</script>

<div class="flex justify-center items-start p-8 gap-8 flex-wrap">
	<Modal bind:show={showModal} on:close={handleClose}>
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div
			contenteditable="true"
			class="w-full outline-none h-full"
			bind:this={editor}
			on:input={handleChange}
			on:keydown={handleKeydown}
		>
			{@html selectedNoteText}
		</div>

		<div slot="footer" class="flex justify-between">
			<Button on:click={handleClose}>Cancel</Button>
			<Button on:click={handleSave}>Save</Button>
		</div>
	</Modal>
	{#each orderedNotes as note, i}
		<Note text={note.text} tabIndex={i + 1} on:click={() => handleEdit(note.id)} />
	{/each}
	<div class="fixed bottom-0 w-full focus:outline-none">
		<div class="my-5 mx-5 float-right">
			<Button on:click={handleCreateClick} rounded>
				<svg
					viewBox="0 0 16 16"
					height="48"
					width="48"
					focusable="false"
					role="img"
					fill="currentColor"
					xmlns="http://www.w3.org/2000/svg"
					class="StyledIconBase-sc-ea9ulj-0 hRnJPC"
					><title>Plus icon</title><path
						d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"
					/></svg
				>
			</Button>
		</div>
	</div>
</div>
