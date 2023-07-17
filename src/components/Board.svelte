<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Button from './Button.svelte';
	import Note from './Note.svelte';
	import type { NoteType } from '../types';

	const dispatch = createEventDispatcher();

	export let notes: NoteType[];
	let currentEditId: string;

	function handleClick(e: MouseEvent) {
		dispatch('createNote', e);
	}

	function handleEdit(id: string) {
		currentEditId = id;
	}
</script>

<div class="flex justify-center items-start p-8 gap-8 flex-wrap">
	{#each notes as note, i}
		<Note
			bind:text={note.text}
			editMode={note.id === currentEditId}
			tabIndex={i + 1}
			on:edit={() => handleEdit(note.id)}
		/>
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
