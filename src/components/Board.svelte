<script lang="ts">
	import type { OriginRect } from '$lib/motion';
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
		onupdatenote: (params: { note: NoteOrdered }) => void;
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
		onupdatenote,
		onclosenote,
		onselect,
		onreorder,
		ondeletenote,
		ontogglefriend
	}: Props = $props();

	function handleModalClose() {
		onclosenote();
	}

	// Closing is NoteEditor's call, not this one — it holds the sheet open
	// through the "Saved" checkmark before closing itself.
	function handleSave({ note }: { note: NoteOrdered }) {
		onupdatenote({ note });
	}

	function handleUpdateColour({ note }: { note: NoteOrdered }) {
		onupdatenote({ note });
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
		clickedOrigin = { noteId: id, rect };
		onselect({ id });
	}

	function handleDrop(toIndex: number, sourceIndex: number) {
		if (sourceIndex !== toIndex) {
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
					ondragstart={(i) => (draggedIndex = i)}
					ondragend={() => (draggedIndex = null)}
				/>
			</NoteDropzone>
		{/snippet}
	</NoteList>
{/if}
