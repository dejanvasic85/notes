<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { page } from '$app/stores';

	import Button from './Button.svelte';
	import Modal from './Modal.svelte';
	import Note from './Note.svelte';

	import type { NoteType } from '../types';
	import { goto } from '$app/navigation';

	const dispatch = createEventDispatcher();

	export let notes: NoteType[];

	function handleClick(e: MouseEvent) {
		dispatch('createNote', e);
	}

	function handleEdit(id: string) {
		goto(`?id=${id}`);
	}

	function handleClose() {
		goto(`/playground`);
	}

	function handleSave() {}

	$: search = new URL($page.url).searchParams;
	$: selectedId = search.get('id');
	$: showModal = !!selectedId;
</script>

<div class="flex justify-center items-start p-8 gap-8 flex-wrap">
	<Modal bind:show={showModal} on:close={handleClose}>
		<Note editMode={true} text={notes.find((n) => n.id === selectedId)?.text ?? ''} tabIndex={0} />
		<div slot="footer">
			<button on:click={handleSave}>Save</button>
			<button on:click={handleClose}>Cancel</button>
		</div>
	</Modal>
	{#each notes as note, i}
		<Note text={note.text} editMode={false} tabIndex={i + 1} on:edit={() => handleEdit(note.id)} />
	{/each}
	<div class="fixed bottom-0 w-full focus:outline-none">
		<div class="my-5 mx-5 float-right">
			<Button on:click={handleClick}>
				<svg
					viewBox="0 0 16 16"
					height="48"
					width="48"
					focusable="false"
					role="img"
					fill="currentColor"
					xmlns="http://www.w3.org/2000/svg"
					class="StyledIconBase-sc-ea9ulj-0 hRnJPC"
					><title>Plus icon</title><path
						d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"
					/></svg
				>
			</Button>
		</div>
	</div>
</div>
