<script lang="ts">
	import { createEventDispatcher, tick } from 'svelte';

	import Button from './Button.svelte';
	import ColourPicker from './ColourPicker.svelte';
	import Icon from './Icon.svelte';
	import Modal from './Modal.svelte';
	import type { NoteType } from '../types';

	// Props
	export let note: NoteType;
	export let showModal: boolean = false;

	// Internal state
	let editor: HTMLDivElement;
	let noteText: string = note.text;
	let isControlDown = false; // Used to detect Ctrl keydown

	// External events
	const dispatch = createEventDispatcher();
	const dispatchNoteSave = createEventDispatcher<{ saveNote: { note: NoteType } }>();
	const dispatchColourUpdate = createEventDispatcher<{ updateColour: { note: NoteType } }>();
	const dispatchDeleteNote = createEventDispatcher<{ deleteNote: { note: NoteType } }>();

	// Internal handlers
	async function handleModalOpen() {
		await tick();
		const selection = window.getSelection();
		const range = document.createRange();
		selection?.removeAllRanges();
		if (editor) {
			range.selectNodeContents(editor);
			range.collapse(false);
			selection?.addRange(range);
			editor.focus();
		}
	}

	function handleSave() {
		dispatchNoteSave('saveNote', {
			note: {
				...note,
				text: noteText
			}
		});
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.repeat) {
			return;
		}

		if (event.key === 'Control' || event.key === 'Meta') {
			isControlDown = true;
			event.preventDefault();
		}

		if (event.key === 'Enter' && isControlDown) {
			handleSave();
		}
	}

	function handleDeleteClick() {
		if (confirm('Are you sure you want to delete this note?')) {
			dispatchDeleteNote('deleteNote', { note });
		}
	}

	function handleColourPick({ detail }: CustomEvent<{ colour: string }>) {
		dispatchColourUpdate('updateColour', {
			note: {
				...note,
				colour: detail.colour
			}
		});
	}
</script>

<Modal bind:show={showModal} on:close on:open={handleModalOpen}>
	<div slot="header">
		<div class="flex justify-between">
			<div class="flex-1">
				<Button variant="ghost" on:click={() => dispatch('close')}>
					<Icon icon="chevronLeft" title="Cancel note edit" />
				</Button>
			</div>
			<div class="flex">
				<ColourPicker on:colourClick={handleColourPick} />
				<Button variant="ghost" on:click={handleDeleteClick}>
					<Icon icon="trash" title="Delete note" />
				</Button>
			</div>
		</div>
	</div>

	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div
		contenteditable="true"
		class="w-full outline-none p-4 h-full"
		bind:this={editor}
		bind:innerHTML={noteText}
		on:keydown={handleKeydown}
	/>

	<div slot="footer" class="flex justify-end">
		<Button on:click={handleSave}>
			<Icon icon="check" size={32} title="Save note" />
		</Button>
	</div>
</Modal>
