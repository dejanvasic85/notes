<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fly } from 'svelte/transition';
	import { getNoteCssClass } from '$lib/colours';
	import type { NoteType } from '../types';

	export let note: NoteType;
	export let tabIndex: number;

	const dispatch = createEventDispatcher();
	const handleClick = () => {
		dispatch('click');
	};

	$: className = getNoteCssClass({
		defaultClass: 'bg-transparent text-base border',
		variant: note.colour
	});
</script>

<div
	class="md:w-60 w-full min-h-48 p-4 rounded-lg {className}"
	tabindex={tabIndex}
	role="button"
	on:click={handleClick}
	on:keypress={handleClick}
	transition:fly={{ x: 15, duration: 400 }}
>
	{@html note.text}
</div>
