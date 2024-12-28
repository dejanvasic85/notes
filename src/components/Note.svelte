<script lang="ts">
	import { getNoteCssClass } from '$lib/colours';
	import type { NoteOrdered, SharedNote } from '$lib/types';

	type Props = {
		note: NoteOrdered | SharedNote;
		index: number;
		isDraggable?: boolean;
		onclick: () => void;
		ondropped?: (toIndex: number, sourceIndex: number) => void;
	};

	let { note, index, isDraggable = true, onclick, ondropped }: Props = $props();
	let isDragging = $state(false);
	let dragOverDepth = $state(0);

	const className = $derived(
		getNoteCssClass({
			colour: note.colour ?? ''
		})
	);

	function handleDragStart(event: DragEvent) {
		event.dataTransfer?.setData('text/plain', index.toString());
		isDragging = true;
	}

	function handleDragEnd() {
		isDragging = false;
	}

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
		if (ondropped) {
			ondropped(index, sourceIndex);
		}
		dragOverDepth = 0;
	}
</script>

<div
	class="grid {isDraggable && dragOverDepth > 0 ? 'grid-rows-2' : ''} w-full gap-2 lg:w-note"
	role="listitem"
	ondragover={handleDragOver}
	ondrop={handleDrop}
	ondragenter={handleDragEnter}
	ondragleave={handleDragLeave}
>
	<div class="rounded-lg bg-slate-500" class:hidden={isDraggable && dragOverDepth === 0}></div>
	<div
		id={note.id}
		aria-label={`Edit note ${index + 1}`}
		class="h-note w-full overflow-hidden rounded-lg p-4 lg:w-note {className} select-none hover:ring-2 dark:hover:ring-darkText"
		class:rotate-6={isDragging}
		tabindex={index}
		role="button"
		draggable={isDraggable}
		{onclick}
		onkeypress={onclick}
		ondragstart={handleDragStart}
		ondragend={handleDragEnd}
	>
		{@html note.text}
	</div>
</div>
