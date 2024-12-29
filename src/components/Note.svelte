<script lang="ts">
	import { getNoteCssClass } from '$lib/colours';
	import type { NoteOrdered, SharedNote } from '$lib/types';

	type Props = {
		note: NoteOrdered | SharedNote;
		index: number;
		isDraggable?: boolean;
		onclick: () => void;
	};

	let { note, index, isDraggable = true, onclick }: Props = $props();
	let isDragging = $state(false);

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
</script>

<div
	id={note.id}
	aria-label={`Edit note ${index + 1}`}
	class="h-full w-full overflow-hidden rounded-lg p-4 {className} select-none hover:ring-2 dark:hover:ring-darkText"
	class:rotate-3={isDragging}
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
