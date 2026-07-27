<script lang="ts">
	import { type Snippet } from 'svelte';

	type Props = {
		children: Snippet<[]>;
		index: number;
		draggedIndex?: number | null;
		ondropped: (toIndex: number, sourceIndex: number) => void;
	};

	let { children, index, draggedIndex = null, ondropped }: Props = $props();

	let dragOverDepth = $state(0);

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
	}

	// dataTransfer.getData() is only readable during `dragstart`/`drop` - browsers
	// return an empty string during dragenter/dragleave/dragover, so the dragged
	// item's index has to come from draggedIndex (tracked by the parent via
	// Note's ondragstart/ondragend) instead of the DragEvent itself.
	function handleDragEnter(event: DragEvent) {
		event.preventDefault();
		if (draggedIndex !== index) {
			dragOverDepth += 1;
		}
	}

	function handleDragLeave(event: DragEvent) {
		event.preventDefault();
		if (draggedIndex !== index) {
			dragOverDepth -= 1;
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
	class="relative w-full"
	role="listitem"
	ondragover={handleDragOver}
	ondrop={handleDrop}
	ondragenter={handleDragEnter}
	ondragleave={handleDragLeave}
>
	{@render children()}
	<!--
		Drop guide. The card stays put and the guide is overlaid rather than
		swapped in: cards are content-sized now, so replacing one with a
		different-sized placeholder would resize the column mid-drag and fire
		another dragleave/dragenter pair, flickering the guide on and off.
	-->
	{#if dragOverDepth > 0}
		<div
			class="rounded-card border-accent pointer-events-none absolute inset-0 border-2 border-dashed"
			aria-hidden="true"
		></div>
	{/if}
</div>
