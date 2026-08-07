<script lang="ts">
	import { onDestroy } from 'svelte';
	import type { Editor } from '@tiptap/core';
	import { fade } from 'svelte/transition';

	import { type Colour } from '$lib/colours';
	import { durationFastMs, easeMove, reduceMotion, type OriginRect } from '$lib/motion';
	import type { FriendSelection, NoteOrdered, ToggleFriendShare } from '$lib/types';
	import { X, Trash2, Check } from '@lucide/svelte';

	import Button from './Button.svelte';
	import Dialog from './Dialog.svelte';
	import Share from './Share.svelte';
	import HtmlEditor from './HtmlEditor.svelte';
	import Toolbar from './Toolbar.svelte';
	import UserAvatar from './UserAvatar.svelte';

	// Save: label crossfades to a check, holds, then returns. No spinner for
	// sub-second work.
	const savedHoldMs = 800;
	const saveIconSize = 20;

	type Props = {
		enableSharing?: boolean;
		note: NoteOrdered;
		friends: FriendSelection[];
		originRect?: OriginRect | null;
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
		originRect = null,
		onclose,
		ondeletenote,
		onsavenote,
		ontogglefriendshare,
		onupdateColour
	}: Props = $props();

	let noteText: string = $state(note.text);
	let noteTextPlain: string = $state(note.textPlain);
	let noteTitle: string | null = $state(note.title);
	let editor: Editor | null = $state(null);
	let justSaved = $state(false);
	// Dialog owns turning this into the real onclose once its own exit
	// animation has played — see Dialog.svelte.
	let dialogShow = $state(true);
	let savedHoldTimeout: ReturnType<typeof setTimeout> | null = null;

	onDestroy(() => {
		if (savedHoldTimeout !== null) {
			clearTimeout(savedHoldTimeout);
		}
	});

	let hasUnsavedChanges = $derived(
		noteText !== note.text || noteTextPlain !== note.textPlain || noteTitle !== note.title
	);

	let editors = $derived(
		friends.filter((f) => note.editors?.some((e) => e.userId === f.id && e.selected))
	);

	// The server stamps updatedAt on every write, so the optimistic copy stamps
	// it too — otherwise the board card keeps showing the previous edit's date
	// until the next refresh.
	function handleSave() {
		onsavenote({
			note: {
				...note,
				text: noteText,
				textPlain: noteTextPlain,
				title: noteTitle,
				updatedAt: new Date(),
				contentUpdatedAt: new Date()
			}
		});
		if (navigator.vibrate) {
			navigator.vibrate(50);
		}

		if (savedHoldTimeout !== null) {
			clearTimeout(savedHoldTimeout);
		}

		justSaved = true;
		savedHoldTimeout = setTimeout(() => {
			savedHoldTimeout = null;
			justSaved = false;
			// handleClose, not onclose directly: further edits typed during the
			// hold would otherwise be discarded with no unsaved-changes prompt.
			handleClose();
		}, savedHoldMs);
	}

	function handleDeleteClick() {
		if (navigator.vibrate) {
			navigator.vibrate(50);
		}
		ondeletenote({
			note: { ...note, text: noteText, textPlain: noteTextPlain, title: noteTitle }
		});
	}

	function handleColourPick(colour: Colour | null) {
		onupdateColour({
			note: {
				...note,
				colour,
				updatedAt: new Date(),
				colourUpdatedAt: new Date()
			}
		});
	}

	const handleClose = () => {
		if (hasUnsavedChanges) {
			if (!confirm('You have unsaved changes. Are you sure you want to close?')) {
				return;
			}
		}

		dialogShow = false;

		if (navigator.vibrate) {
			navigator.vibrate(50);
		}
	};

	const handleContentUpdate = (html: string, plaintext: string) => {
		noteText = html;
		noteTextPlain = plaintext;
	};
</script>

<svelte:window onkeydown={(e) => e.code === 'Escape' && handleClose()} />

<Dialog bind:show={dialogShow} colour={note.colour} {originRect} {onclose}>
	{#snippet header()}
		<div class="px-2 pt-2">
			<div class="flex justify-between">
				<div class="flex-1">
					<Button variant="ghost" onclick={handleClose} label="Cancel note edit">
						<X />
					</Button>
				</div>
				<div class="flex gap-2">
					{#if enableSharing && !note.shared}
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
					{#if !note.shared}
						<Button variant="ghost" onclick={handleDeleteClick} label="Delete note">
							<Trash2 />
						</Button>
					{/if}
				</div>
			</div>
		</div>
	{/snippet}

	{#snippet body()}
		<input
			type="text"
			bind:value={noteTitle}
			placeholder="Title"
			class="font-display placeholder:text-ink-faint w-full bg-transparent px-4 py-2 text-xl font-semibold"
		/>
		<HtmlEditor
			id="note-editor"
			initialContent={noteText}
			onupdate={handleContentUpdate}
			oneditorcreate={(e) => (editor = e)}
		/>
	{/snippet}

	{#snippet floating()}
		<Toolbar {editor} oncolourpick={handleColourPick} />
	{/snippet}

	{#snippet footer()}
		<div class="flex justify-between py-2 pr-2 pl-4">
			<div class="flex items-center gap-4">
				{#if note.shared}
					<UserAvatar
						picture={note.owner.picture || ''}
						name={note.owner.name || ''}
						size={7}
						tooltip="{note.owner.name} (owner)"
					/>
				{/if}
				{#each editors as editor (editor.id)}
					<UserAvatar picture={editor.picture || ''} name={editor.name || ''} size={7} />
				{/each}
			</div>
			<div class="ml-auto">
				<Button onclick={handleSave} label={justSaved ? 'Note saved' : 'Save note'}>
					{#key justSaved}
						<span
							class="inline-flex items-center"
							in:fade={{ duration: reduceMotion(durationFastMs), easing: easeMove }}
							out:fade={{ duration: reduceMotion(durationFastMs), easing: easeMove }}
						>
							{#if justSaved}
								<Check size={saveIconSize} aria-hidden="true" />
							{:else}
								Save note
							{/if}
						</span>
					{/key}
				</Button>
			</div>
		</div>
	{/snippet}
</Dialog>
