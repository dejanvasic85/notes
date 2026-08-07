<script lang="ts">
	import { onDestroy } from 'svelte';
	import type { Editor } from '@tiptap/core';

	import { type Colour } from '$lib/colours';
	import type { OriginRect } from '$lib/motion';
	import type { FriendSelection, NoteOrdered, ToggleFriendShare } from '$lib/types';
	import { X, Trash2 } from '@lucide/svelte';

	import Button from './Button.svelte';
	import Dialog from './Dialog.svelte';
	import SaveStatus from './SaveStatus.svelte';
	import Share from './Share.svelte';
	import HtmlEditor from './HtmlEditor.svelte';
	import Toolbar from './Toolbar.svelte';
	import UserAvatar from './UserAvatar.svelte';

	// Autosave fires this long after the last keystroke.
	const autosaveDebounceMs = 1000;
	// The "Saved" check holds this long before fading out.
	const savedHoldMs = 800;

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
	let autosaveTimeout: ReturnType<typeof setTimeout> | null = null;
	// Deleting removes the note from board state immediately (the undo window
	// only delays the server call) - the teardown save below must not fire for
	// a note that's already gone, or it 404s/throws trying to update it.
	let isDeleting = false;

	onDestroy(() => {
		if (savedHoldTimeout !== null) {
			clearTimeout(savedHoldTimeout);
		}
		if (autosaveTimeout !== null) {
			clearTimeout(autosaveTimeout);
		}
		// Safety net for any teardown path that doesn't go through handleClose.
		if (!isDeleting && hasUnsavedChanges) {
			commitSave();
		}
	});

	let hasUnsavedChanges = $derived(
		noteText !== note.text || noteTextPlain !== note.textPlain || noteTitle !== note.title
	);

	let editors = $derived(
		friends.filter((f) => note.editors?.some((e) => e.userId === f.id && e.selected))
	);

	// Debounced autosave: re-arms on every keystroke, fires once typing pauses.
	// Computes the dirty check from the raw state directly rather than reading
	// `hasUnsavedChanges` — Svelte skips effect reruns when a derived's own
	// output value is unchanged, which would otherwise turn this into a
	// periodic save (firing every ~autosaveDebounceMs while typing continues)
	// instead of a true trailing debounce.
	$effect(() => {
		const isDirty =
			noteText !== note.text || noteTextPlain !== note.textPlain || noteTitle !== note.title;

		if (!isDirty) {
			return;
		}
		autosaveTimeout = setTimeout(handleSave, autosaveDebounceMs);
		return () => {
			if (autosaveTimeout !== null) {
				clearTimeout(autosaveTimeout);
				autosaveTimeout = null;
			}
		};
	});

	// The server stamps updatedAt on every write, so the optimistic copy stamps
	// it too — otherwise the board card keeps showing the previous edit's date
	// until the next refresh.
	function commitSave() {
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
	}

	function handleSave() {
		commitSave();

		if (savedHoldTimeout !== null) {
			clearTimeout(savedHoldTimeout);
		}

		justSaved = true;
		savedHoldTimeout = setTimeout(() => {
			savedHoldTimeout = null;
			justSaved = false;
		}, savedHoldMs);
	}

	function handleDeleteClick() {
		isDeleting = true;
		if (autosaveTimeout !== null) {
			clearTimeout(autosaveTimeout);
			autosaveTimeout = null;
		}

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
		// Cancel the pending debounced autosave first - Dialog.svelte keeps this
		// component mounted through its exit animation, so a timer left running
		// could still fire mid-animation and send a second, redundant save.
		if (autosaveTimeout !== null) {
			clearTimeout(autosaveTimeout);
			autosaveTimeout = null;
		}

		if (hasUnsavedChanges) {
			commitSave();
		}

		if (savedHoldTimeout !== null) {
			clearTimeout(savedHoldTimeout);
			savedHoldTimeout = null;
		}
		justSaved = false;

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
				<div class="flex items-center gap-2">
					<SaveStatus {justSaved} />
					{#if note.shared}
						<UserAvatar
							picture={note.owner.picture || ''}
							name={note.owner.name || ''}
							size={7}
							tooltip="{note.owner.name} (owner)"
						/>
						{#each editors as editor (editor.id)}
							<UserAvatar picture={editor.picture || ''} name={editor.name || ''} size={7} />
						{/each}
					{:else}
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
</Dialog>
