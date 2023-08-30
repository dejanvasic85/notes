<script lang="ts">
	import { createEventDispatcher, tick } from 'svelte';

	import { getNoteCssClass, type Colour } from '$lib/colours';
	import type { Note } from '../types';

	import Button from './Button.svelte';
	import ColourPicker from './ColourPicker.svelte';
	import Icon from './Icon.svelte';
	import Modal from './Modal.svelte';

	// Props
	export let note: Note;
	export let showModal: boolean = false;

	// Internal state
	let editor: HTMLDivElement;
	let noteText: string = note.text;
	let isControlDown = false; // Used to detect Ctrl keydown

	// External events
	const dispatch = createEventDispatcher();
	const dispatchNoteSave = createEventDispatcher<{ saveNote: { note: Note } }>();
	const dispatchColourUpdate = createEventDispatcher<{ updateColour: { note: Note } }>();
	const dispatchDeleteNote = createEventDispatcher<{ deleteNote: { note: Note } }>();

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

	function handleColourPick({ detail }: CustomEvent<{ colour: Colour }>) {
		dispatchColourUpdate('updateColour', {
			note: {
				...note,
				colour: detail.colour
			}
		});
	}

	$: className = getNoteCssClass({
		defaultClass: 'bg-white dark:bg-slate-800 dark:text-white border',
		variant: note.colour
	});
</script>

<Modal bind:show={showModal} on:close on:open={handleModalOpen} {className}>
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
		class="h-full w-full p-4 outline-none"
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
