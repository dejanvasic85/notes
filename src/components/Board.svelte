<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Button from './Button.svelte';

	const dispatch = createEventDispatcher();

	function handleClick(e: MouseEvent) {
		console.log('here we go', e);
		dispatch('createNote', e);
	}
</script>

<div class="flex p-8 gap-8 flex-wrap">
	<slot />
	<div class="absolute bottom-4 right-4">
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
