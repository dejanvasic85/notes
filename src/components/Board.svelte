<script lang="ts">
	import type { OriginRect } from '$lib/motion';
	import { playCue } from '$lib/sound';
	import type { Friend, NoteOrdered, ToggleFriendShare } from '$lib/types';

	import Note from './Note.svelte';
	import NoteEditor from './NoteEditor.svelte';
	import NoteDropzone from './NoteDropzone.svelte';
	import NoteList from './NoteList.svelte';

	type Props = {
		notes: NoteOrdered[];
		selectedNote?: NoteOrdered | null;
		enableSharing?: boolean;
		emptyMessage?: string;
		friends?: Friend[];
		onclosenote: () => void;
		onsavenote: (params: { note: NoteOrdered }) => Promise<boolean>;
		onupdatecolour: (params: { note: NoteOrdered }) => void;
		onselect: (params: { id: string }) => void;
		onreorder: (params: { fromIndex: number; toIndex: number }) => void;
		ondeletenote: (params: { note: NoteOrdered }) => void;
		ontogglefriend?: (params: ToggleFriendShare) => void;
	};

	let {
		notes,
		selectedNote,
		enableSharing = false,
		emptyMessage = 'Nothing to see yet! Go on create a note.',
		friends = [],
		onsavenote,
		onupdatecolour,
		onclosenote,
		onselect,
		onreorder,
		ondeletenote,
		ontogglefriend
	}: Props = $props();

	function handleModalClose() {
		playCue('whoosh');
		onclosenote();
	}

	// NoteEditor autosaves as the user types and flushes on close — this is
	// just a pass-through, no save/close orchestration lives here.
	function handleSave({ note }: { note: NoteOrdered }): Promise<boolean> {
		return onsavenote({ note });
	}

	function handleUpdateColour({ note }: { note: NoteOrdered }) {
		onupdatecolour({ note });
	}

	// Keyed to the note it was captured for — otherwise a note opened by a
	// route other than clicking its card (creating one, a deep link) would
	// grow from whatever card was last clicked instead of falling back to a
	// plain fade.
	type ClickedOrigin = { noteId: string; rect: OriginRect };
	let clickedOrigin = $state<ClickedOrigin | null>(null);
	let originRect = $derived.by(() => {
		if (!clickedOrigin || !selectedNote || clickedOrigin.noteId !== selectedNote.id) {
			return null;
		}
		return clickedOrigin.rect;
	});

	function handleEdit(id: string, rect: DOMRect) {
		playCue('swoosh');
		clickedOrigin = { noteId: id, rect };
		onselect({ id });
	}

	function handleDrop(toIndex: number, sourceIndex: number) {
		if (sourceIndex !== toIndex) {
			playCue('thock');
			onreorder({ fromIndex: sourceIndex, toIndex });
		}
	}

	let draggedIndex: number | null = $state(null);

	let selectedNoteFriends = $derived(
		friends.map((f) => {
			const editor = selectedNote?.editors?.find((e) => e.userId === f.id);
			return {
				noteEditorId: editor?.id,
				selected: editor?.selected || false,
				email: f.email,
				id: f.id,
				name: f.name,
				picture: f.picture
			};
		})
	);
</script>

{#if selectedNote}
	<!--
		Keyed by id: switching directly from one open note to another (same
		truthy -> truthy transition) would otherwise reuse this instance and
		leave its local open/close animation state (Dialog's isPresent,
		NoteEditor's dialogShow) stuck from the note that was just closed,
		instead of starting fresh for the new one.
	-->
	{#key selectedNote.id}
		<NoteEditor
			{enableSharing}
			{ondeletenote}
			{originRect}
			note={selectedNote}
			friends={selectedNoteFriends}
			onclose={handleModalClose}
			ontogglefriendshare={(params) => ontogglefriend?.(params)}
			onsavenote={handleSave}
			onupdateColour={handleUpdateColour}
		/>
	{/key}
{/if}

{#if notes.length === 0}
	<p>{emptyMessage}</p>
{:else}
	<NoteList items={notes} key={(note) => note.id}>
		{#snippet item(note, index)}
			<NoteDropzone {index} {draggedIndex} ondropped={handleDrop}>
				<Note
					{note}
					{friends}
					{index}
					isDraggable={true}
					onclick={(rect) => handleEdit(note.id, rect)}
					ondragstart={(i) => {
						playCue('press');
						draggedIndex = i;
					}}
					ondragend={() => (draggedIndex = null)}
				/>
			</NoteDropzone>
		{/snippet}
	</NoteList>
{/if}
