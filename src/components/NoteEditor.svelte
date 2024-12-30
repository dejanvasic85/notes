<script lang="ts">
	import { tick } from 'svelte';

	import { type Colour } from '$lib/colours';
	import type { FriendSelection, NoteOrdered, ToggleFriendShare } from '$lib/types';

	import Button from './Button.svelte';
	import ColourPicker from './ColourPicker.svelte';
	import Dialog from './Dialog.svelte';
	import Icon from './Icon.svelte';
	import Share from './Share.svelte';

	type Props = {
		enableSharing?: boolean;
		note: NoteOrdered;
		friends: FriendSelection[];
		onclose: () => void;
		ondeletenote: (params: { note: NoteOrdered }) => void;
		onsavenote: (params: { note: NoteOrdered }) => void;
		ontogglefriendshare: (params: ToggleFriendShare) => void;
		onupdateColour: (params: { note: NoteOrdered }) => void;
	};

	let {
		enableSharing = false,
		note,
		friends = [],
		onclose,
		ondeletenote,
		onsavenote,
		ontogglefriendshare,
		onupdateColour
	}: Props = $props();

	// Internal state
	let editor: HTMLDivElement;
	let noteText: string = $state(note.text);
	let noteTextPlain: string = $state(note.textPlain);

	// Internal handlers
	async function handleModalOpen() {
		await moveCursorToEnd();
	}

	function handleSave() {
		onsavenote({
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
			ondeletenote({ note });
		}
	}

	function handleColourPick(colour: Colour | null) {
		onupdateColour({
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
		onclose();
	};
</script>

<Dialog show={true} colour={note.colour} onopen={handleModalOpen}>
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
								ontogglefriendshare({
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
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			contenteditable="true"
			class="h-full w-full p-4 outline-none"
			bind:this={editor}
			bind:innerHTML={noteText}
			bind:innerText={noteTextPlain}
			onkeydown={handleKeydown}
			onpaste={handlePaste}
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
