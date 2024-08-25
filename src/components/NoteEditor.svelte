<script lang="ts">
	import { createEventDispatcher, tick } from 'svelte';

	import { getNoteCssClass, type Colour } from '$lib/colours';
	import type { NoteOrdered } from '$lib/types';

	import Button from './Button.svelte';
	import ColourPicker from './ColourPicker.svelte';
	import Icon from './Icon.svelte';
	import Modal from './Modal.svelte';
	import Share from './Share.svelte';

	// Props
	export let enableSharing: boolean = false;
	export let note: NoteOrdered;
	export let showModal: boolean = false;

	// Internal state
	let editor: HTMLDivElement;
	let noteText: string = note.text;
	let noteTextPlain: string = note.textPlain;

	// External events
	const dispatch = createEventDispatcher();
	const dispatchNoteSave = createEventDispatcher<{ saveNote: { note: NoteOrdered } }>();
	const dispatchColourUpdate = createEventDispatcher<{ updateColour: { note: NoteOrdered } }>();
	const dispatchDeleteNote = createEventDispatcher<{ deleteNote: { note: NoteOrdered } }>();

	// Internal handlers
	async function handleModalOpen() {
		await moveCursorToEnd();
	}

	function handleSave() {
		dispatchNoteSave('saveNote', {
			note: {
				...note,
				text: noteText,
				textPlain: noteTextPlain
			}
		});
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.repeat) {
			return;
		}

		if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
			handleSave();
		}
	}

	function handlePaste(event: ClipboardEvent) {
		event.preventDefault();
		const text = event.clipboardData?.getData('text/plain') ?? '';
		document.execCommand('insertHTML', false, text);
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

	async function moveCursorToEnd() {
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

	$: className = getNoteCssClass({
		defaultClass: 'bg-white dark:bg-slate-800 dark:text-white border',
		variant: note.colour ?? ''
	});
</script>

<Modal bind:show={showModal} on:close on:open={handleModalOpen} {className}>
	<div slot="header" class="px-2 pt-2">
		<div class="flex justify-between">
			<div class="flex-1">
				<Button variant="ghost" on:click={() => dispatch('close')}>
					<Icon icon="chevronLeft" title="Cancel note edit" />
				</Button>
			</div>
			<div class="flex">
				{#if enableSharing}
					<Share
						collaborators={[
							{ id: '1', name: 'Alice', selected: false },
							{ id: '2', name: 'Bob', selected: true }
						]}
						isOpen={false}
						on:add={() => console.log('todo: Add friend!')}
						on:toggleFriend={({ detail }) => console.log('todo: toggle friend...', detail.id)}
					/>
				{/if}
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
		bind:innerText={noteTextPlain}
		on:keydown={handleKeydown}
		on:paste={handlePaste}
	/>

	<div slot="footer">
		<div class="flex justify-between px-2 pb-2">
			<Button on:click={handleSave}>
				<Icon icon="check" size={32} title="Save note" />
			</Button>
		</div>
	</div>
</Modal>
