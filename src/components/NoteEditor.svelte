<script lang="ts">
	import { createEventDispatcher, tick } from 'svelte';

	import { type Colour } from '$lib/colours';
	import type { FriendSelection, NoteOrdered, ToggleFriendShare } from '$lib/types';

	import Button from './Button.svelte';
	import ColourPicker from './ColourPicker.svelte';
	import Dialog from './Dialog.svelte';
	import Icon from './Icon.svelte';
	import Share from './Share.svelte';

	type ComponentEvents = {
		close: {};
		deleteNote: { note: NoteOrdered };
		saveNote: { note: NoteOrdered };
		toggleFriendShare: ToggleFriendShare;
		updateColour: { note: NoteOrdered };
	};

	// Props
	export let enableSharing: boolean = false;
	export let note: NoteOrdered;
	export let showModal: boolean = false;
	export let friends: FriendSelection[] = [];

	// Internal state
	let editor: HTMLDivElement;
	let noteText: string = note.text;
	let noteTextPlain: string = note.textPlain;

	// External events
	const dispatch = createEventDispatcher<ComponentEvents>();

	// Internal handlers
	async function handleModalOpen() {
		await moveCursorToEnd();
	}

	function handleSave() {
		dispatch('saveNote', {
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

		if (event.key === 'Escape') {
			handleClose();
		}
	}

	function handlePaste(event: ClipboardEvent) {
		event.preventDefault();
		const text = event.clipboardData?.getData('text/plain') ?? '';
		document.execCommand('insertHTML', false, text);
	}

	function handleDeleteClick() {
		if (confirm('Are you sure you want to delete this note?')) {
			dispatch('deleteNote', { note });
		}
	}

	function handleColourPick(colour: Colour | null) {
		dispatch('updateColour', {
			note: {
				...note,
				colour
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

	const handleClose = () => {
		dispatch('close', {});
	};
</script>

<Dialog show={showModal} colour={note.colour} onopen={handleModalOpen}>
	{#snippet header()}
		<div class="px-2 pt-2">
			<div class="flex justify-between">
				<div class="flex-1">
					<Button variant="ghost" onclick={handleClose}>
						<Icon icon="arrow-left" title="Cancel note edit" />
					</Button>
				</div>
				<div class="flex gap-2">
					{#if enableSharing}
						<Share
							{friends}
							noteId={note.id}
							ontogglefriend={({ id, friendUserId, selected }) =>
								dispatch('toggleFriendShare', {
									id,
									friendUserId,
									noteId: note.id,
									selected
								})}
						/>
					{/if}
					<ColourPicker onselect={handleColourPick} />
					<Button variant="ghost" onclick={handleDeleteClick}>
						<Icon icon="trash" title="Delete note" fill="none" />
					</Button>
				</div>
			</div>
		</div>
	{/snippet}

	{#snippet body()}
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div
			contenteditable="true"
			class="h-full w-full p-4 outline-none"
			bind:this={editor}
			bind:innerHTML={noteText}
			bind:innerText={noteTextPlain}
			on:keydown={handleKeydown}
			on:paste={handlePaste}
		></div>
	{/snippet}

	{#snippet footer()}
		<div class="flex justify-between px-2 pb-2">
			<div class="ml-auto">
				<Button onclick={handleSave}>
					<Icon icon="check" title="Save note" fill="none" />
				</Button>
			</div>
		</div>
	{/snippet}
</Dialog>
