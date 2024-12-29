<script lang="ts">
	import { type Snippet } from 'svelte';

	type Props = {
		children?: Snippet<[]>;
		index: number;
		ondropped: (toIndex: number, sourceIndex: number) => void;
	};

	let { children, index, ondropped }: Props = $props();

	let dragOverDepth = $state(0);

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
	}

	function handleDragEnter(event: DragEvent) {
		event.preventDefault();
		const sourceIndex = parseInt(event.dataTransfer?.getData('text/plain') ?? '');
		if (sourceIndex !== index) {
			dragOverDepth += 1;
		}
	}

	function handleDragLeave(event: DragEvent) {
		event.preventDefault();
		const sourceIndex = parseInt(event.dataTransfer?.getData('text/plain') ?? '');
		if (sourceIndex !== index) {
			dragOverDepth = 0;
		}
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		const sourceIndex = parseInt(event.dataTransfer?.getData('text/plain') ?? '');
		ondropped(index, sourceIndex);
		dragOverDepth = 0;
	}
</script>

<div
	class="grid h-full w-full gap-2 lg:w-note"
	role="listitem"
	ondragover={handleDragOver}
	ondrop={handleDrop}
	ondragenter={handleDragEnter}
	ondragleave={handleDragLeave}
>
	{#if children && dragOverDepth === 0}
		{@render children()}
	{:else}
		<!-- Drop -->
		<div class="h-full w-full rounded-lg bg-slate-400 dark:bg-darkHover"></div>
	{/if}
</div>
