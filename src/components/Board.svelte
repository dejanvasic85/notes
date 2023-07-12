<script lang="ts">
	import Button from './Button.svelte';

	function handleClick(e: MouseEvent) {
		console.log('here we go', e);
	}
</script>

<div class="flex p-8 gap-8">
	<slot />
	<div class="absolute bottom-20 right-20">
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
