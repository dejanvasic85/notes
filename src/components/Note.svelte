<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fly } from 'svelte/transition';
	import { getNoteCssClass } from '$lib/colours';
	import type { NoteType } from '../types';

	export let note: NoteType;

	const dispatch = createEventDispatcher();
	const handleClick = () => {
		dispatch('click');
	};

	$: className = getNoteCssClass({
		defaultClass: 'bg-transparent text-base border',
		variant: note.colour
	});
</script>

<!-- svelte-ignore a11y-interactive-supports-focus -->
<div
	class="min-h-48 w-full rounded-lg p-4 md:w-60 {className}"
	role="button"
	on:click={handleClick}
	on:keypress={handleClick}
	transition:fly={{ x: 15, duration: 400 }}
>
	{@html note.text}
</div>
