<script lang="ts">
	export let text: string;
</script>

<div
	contenteditable="true"
	class="w-60 min-h-48 border p-4 bg-cyan-50 shadow-xl"
	bind:innerHTML={text}
/>
