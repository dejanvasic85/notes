<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { page } from '$app/stores';

	import Button from './Button.svelte';
	import Modal from './Modal.svelte';
	import Note from './Note.svelte';

	import type { NoteType } from '../types';
	import { goto } from '$app/navigation';

	// Props
	export let notes: NoteType[];

	let currentNoteText: string = '';
	let editor: HTMLDivElement;

	const dispatchCreate = createEventDispatcher();
	const dispatchUpdate = createEventDispatcher<{ updateNote: NoteType }>();

	function handleClose() {
		goto(`/playground`);
	}

	function handleSave() {
		if (!selectedNote) {
			return;
		}
		dispatchUpdate('updateNote', { ...selectedNote, text: currentNoteText });
		handleClose();
	}

	function handleClick(e: MouseEvent) {
		dispatchCreate('createNote', e);
	}

	function handleEdit(id: string) {
		goto(`?id=${id}`);
	}

	function handleChange() {
		currentNoteText = editor.innerHTML;
	}

	$: orderedNotes = notes.sort((a, b) => a.sequence - b.sequence);
	$: search = new URL($page.url).searchParams;
	$: selectedId = search.get('id');
	$: selectedNote = notes.find((n) => n.id === selectedId);
	$: selectedNoteText = selectedNote?.text ?? '';
	$: showModal = !!selectedId;
</script>

<div class="flex justify-center items-start p-8 gap-8 flex-wrap">
	<Modal bind:show={showModal} on:close={handleClose}>
		<div>
			<div
				bind:this={editor}
				on:input={handleChange}
				contenteditable="true"
				class="w-60 min-h-48 border p-4 bg-cyan-50 shadow-xl"
			>
				{@html selectedNoteText}
			</div>
		</div>
		<div slot="footer">
			<button on:click={handleSave}>Save</button>
			<button on:click={handleClose}>Cancel</button>
		</div>
	</Modal>
	{#each orderedNotes as note, i}
		<Note text={note.text} tabIndex={i + 1} on:click={() => handleEdit(note.id)} />
	{/each}
	<div class="fixed bottom-0 w-full focus:outline-none">
		<div class="my-5 mx-5 float-right">
			<Button on:click={handleClick}>
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
