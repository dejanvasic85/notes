<script lang="ts">
	import { createEventDispatcher, tick } from 'svelte';

	import Button from './Button.svelte';
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

	// Internal handlers
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
</script>

<Modal bind:show={showModal} on:close on:open={handleModalOpen}>
	<div slot="header">
		<Button variant="ghost" on:click={() => dispatch('close')}>
			<Icon icon="chevronLeft" />
		</Button>
	</div>
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div
		contenteditable="true"
		class="w-full outline-none p-4 h-full"
		bind:this={editor}
		bind:innerHTML={noteText}
		on:keydown={handleKeydown}
	>
		<!-- {@html noteText} -->
	</div>

	<div slot="footer" class="flex justify-end">
		<Button on:click={handleSave}>
			<Icon icon="check" size={32} />
		</Button>
	</div>
</Modal>
