<script lang="ts">
	import { createEventDispatcher, tick } from 'svelte';

	import type { NoteType } from '../types';

	import Button from './Button.svelte';
	import Icon from './Icon.svelte';
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

	function handleModalClose() {
		dispatchCancelUpdate('cancelUpdate');
	}

	async function handleModalOpen() {
		await tick();
		const selection = window.getSelection();
		const range = document.createRange();
		selection?.removeAllRanges();
		range.selectNodeContents(editor);
		range.collapse(false);
		selection?.addRange(range);
		editor.focus();
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
	<Modal bind:show={showModal} on:close={handleModalClose} on:open={handleModalOpen}>
		<div slot="header">
			<Button variant="ghost" on:click={handleModalClose}>
				<Icon icon="chevronLeft" />
			</Button>
		</div>
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div
			contenteditable="true"
			class="w-full outline-none p-4 h-full"
			bind:this={editor}
			on:input={handleChange}
			on:keydown={handleKeydown}
		>
			{@html selectedNoteText}
		</div>

		<div slot="footer" class="flex justify-end">
			<Button on:click={handleSave}>
				<Icon icon="check" size={32} />
			</Button>
		</div>
	</Modal>
	{#each orderedNotes as note, i}
		<Note text={note.text} tabIndex={i + 1} on:click={() => handleEdit(note.id)} />
	{/each}
	<div class="fixed bottom-0 w-full focus:outline-none">
		<div class="my-5 mx-5 float-right">
			<Button on:click={handleCreateClick} rounded>
				<Icon icon="plus" size={48} />
			</Button>
		</div>
	</div>
</div>
