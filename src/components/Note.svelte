<script lang="ts">
	export let text: string;
</script>

<div
	contenteditable="true"
	class="w-64 min-h-64 border p-4 bg-cyan-50 shadow-lg"
	bind:innerHTML={text}
/>
