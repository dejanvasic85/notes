<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let text: string;
	export let tabIndex: number;

	const dispatch = createEventDispatcher();
	const handleClick = () => {
		dispatch('click');
	};
</script>

<div
	class="w-60 min-h-48 border p-4 bg-cyan-50 shadow-xl"
	tabindex={tabIndex}
	role="button"
	on:click={handleClick}
	on:keypress={handleClick}
>
	{@html text}
</div>
