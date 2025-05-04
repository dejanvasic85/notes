<script lang="ts">
	import { type Colour } from '$lib/colours';
	import type { FriendSelection, NoteOrdered, ToggleFriendShare } from '$lib/types';

	import Button from './Button.svelte';
	import ColourPicker from './ColourPicker.svelte';
	import Dialog from './Dialog.svelte';
	import Icon from './Icon.svelte';
	import Share from './Share.svelte';
	import HtmlEditor from './HtmlEditor.svelte';
	import UserAvatar from './UserAvatar.svelte';

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

	let noteText: string = $state(note.text);
	let noteTextPlain: string = $state(note.textPlain);
	let noteTitle: string | null = $state(note.title);

	let editors = $derived(
		friends.filter((f) => note.editors?.some((e) => e.userId === f.id && e.selected))
	);

	function handleSave() {
		onsavenote({
			note: {
				...note,
				text: noteText,
				textPlain: noteTextPlain,
				title: noteTitle
			}
		});
		if (navigator.vibrate) {
			navigator.vibrate(50);
		}
	}

	function handleDeleteClick() {
		if (navigator.vibrate) {
			navigator.vibrate(50);
		}
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

	const handleClose = () => {
		onclose();

		if (navigator.vibrate) {
			navigator.vibrate(50);
		}
	};

	const handleContentUpdate = (html: string, plaintext: string) => {
		noteText = html;
		noteTextPlain = plaintext;
	};
</script>

<svelte:window onkeydown={(e) => e.code === 'Escape' && onclose()} />

<Dialog show={true} colour={note.colour}>
	{#snippet header()}
		<div class="px-2 pt-2">
			<div class="flex justify-between">
				<div class="flex-1">
					<Button variant="ghost" onclick={handleClose}>
						<Icon icon="x-mark" title="Cancel note edit" />
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
					<ColourPicker onselect={handleColourPick} />
					{#if !note.shared}
						<Button variant="ghost" onclick={handleDeleteClick}>
							<Icon icon="trash" title="Delete note" fill="none" />
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
			class="w-full bg-transparent px-4 py-2 text-xl font-bold focus-visible:outline-none"
		/>
		<HtmlEditor initialContent={noteText} onupdate={handleContentUpdate} />
	{/snippet}

	{#snippet footer()}
		<div class="flex justify-between py-2 pl-4 pr-2">
			<div class="flex items-center gap-4">
				{#if note.shared}
					<UserAvatar
						picture={note.owner.picture || ''}
						name={note.owner.name || ''}
						size={7}
						tooltip="{note.owner.name} (owner)"
					/>
				{/if}
				{#each editors as editor}
					<UserAvatar picture={editor.picture || ''} name={editor.name || ''} size={7} />
				{/each}
			</div>
			<div class="ml-auto">
				<Button onclick={handleSave}>
					<Icon icon="check" title="Save note" fill="none" />
				</Button>
			</div>
		</div>
	{/snippet}
</Dialog>
