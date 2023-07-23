<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fly } from 'svelte/transition';

	export let text: string;
	export let tabIndex: number;

	const dispatch = createEventDispatcher();
	const handleClick = () => {
		dispatch('click');
	};
</script>

<div
	class="md:w-60 w-full min-h-48 border p-4 bg-transparent rounded-lg"
	tabindex={tabIndex}
	role="button"
	on:click={handleClick}
	on:keypress={handleClick}
	transition:fly={{ x: 15, duration: 400 }}
>
	{@html text}
</div>
