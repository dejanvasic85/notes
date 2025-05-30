<script lang="ts">
	import { type Snippet } from 'svelte';

	type Props = {
		children: Snippet<[]>;
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
	class="lg:w-note h-full w-full"
	role="listitem"
	ondragover={handleDragOver}
	ondrop={handleDrop}
	ondragenter={handleDragEnter}
	ondragleave={handleDragLeave}
>
	<div class="h-full w-full {dragOverDepth > 0 ? 'hidden' : 'block'}">
		{@render children()}
	</div>
	<!-- Drop guide -->
	<div
		class="h-full w-full rounded-lg border-2 border-dashed {dragOverDepth === 0
			? 'hidden'
			: 'block'}"
	></div>
</div>
