<script lang="ts">
	import type { Friend, NoteOrdered, SharedNote, ToggleFriendShare } from '$lib/types';

	import Note from './Note.svelte';
	import NoteEditor from './NoteEditor.svelte';
	import NoteViewer from './NoteViewer.svelte';
	import NoteDropzone from './NoteDropzone.svelte';
	import NoteContainer from './NoteContainer.svelte';

	type Props = {
		notes: NoteOrdered[];
		selectedNote?: NoteOrdered | null;
		selectedSharedNote?: SharedNote | null;
		enableSharing?: boolean;
		friends?: Friend[];
		sharedNotes?: SharedNote[];
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
		selectedSharedNote,
		enableSharing = false,
		friends = [],
		sharedNotes = [],
		onupdatenote,
		onclosenote,
		onselect,
		onreorder,
		ondeletenote,
		ontogglefriend
	}: Props = $props();

	function handleModalClose(noteId: string) {
		onclosenote();
		setTimeout(() => {
			const noteElement = document.getElementById(noteId);
			if (noteElement) {
				noteElement.scrollIntoView({ behavior: 'instant', block: 'center' });
				noteElement.focus();
			}
		}, 50);
	}

	function handleSave({ note }: { note: NoteOrdered }) {
		onupdatenote({ note });
		handleModalClose(note.id);
	}

	function handleUpdateColour({ note }: { note: NoteOrdered }) {
		onupdatenote({ note });
	}

	function handleEdit(id?: string) {
		if (id) {
			onselect({ id });
		}
	}

	function handleSharedNoteSelected(id?: string) {
		if (id) {
			onselect({ id });
		}
	}

	function handleDrop(toIndex: number, sourceIndex: number) {
		if (sourceIndex !== toIndex) {
			onreorder({ fromIndex: sourceIndex, toIndex });
		}
	}

	let showModal = $derived(!!selectedNote?.id || !!selectedSharedNote?.id);
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
	<NoteEditor
		{showModal}
		{enableSharing}
		{ondeletenote}
		note={selectedNote}
		friends={selectedNoteFriends}
		onclose={() => handleModalClose(selectedNote.id)}
		ontogglefriendshare={(params) => ontogglefriend?.(params)}
		onsavenote={handleSave}
		onupdateColour={handleUpdateColour}
	/>
{/if}

{#if selectedSharedNote}
	<NoteViewer
		{showModal}
		noteHtmlText={selectedSharedNote.text}
		noteColour={selectedSharedNote.colour}
		onclose={() => handleModalClose(selectedSharedNote.id)}
	/>
{/if}

{#if notes.length === 0}
	<p>Nothing to see here yet! Go on, create a note.</p>
{:else}
	<div class="flex flex-wrap items-stretch gap-6" role="list">
		{#each notes as note, index}
			<NoteContainer>
				<NoteDropzone {index} ondropped={handleDrop}>
					<Note {note} {index} isDraggable={true} onclick={() => handleEdit(note.id)} />
				</NoteDropzone>
			</NoteContainer>
		{/each}
	</div>
{/if}

{#if sharedNotes.length > 0}
	<div class="mt-8 pl-10">
		<h1 class="text-2xl">Shared notes</h1>
	</div>
	<div class="flex flex-wrap items-stretch gap-6">
		{#each sharedNotes as sharedNote, index}
			<NoteContainer>
				<Note
					note={sharedNote}
					{index}
					isDraggable={false}
					onclick={() => handleSharedNoteSelected(sharedNote.id)}
				/>
			</NoteContainer>
		{/each}
	</div>
{/if}
