<script lang="ts">
	import { getNoteCssClass } from '$lib/colours';
	import { draggable } from '$lib/draggable';
	import type { NoteOrdered, SharedNote } from '$lib/types';

	type Props = {
		note: NoteOrdered | SharedNote;
		index: number;
		isDraggable?: boolean;
		onclick: () => void;
	};

	const { note, index, isDraggable = true, onclick }: Props = $props();
	const className = getNoteCssClass({
		colour: note.colour ?? ''
	});

	let divElement: HTMLElement;

	$effect(() => {
		if (isDraggable) {
			draggable(divElement, { index });
		}
	});
</script>

<div
	class="h-note w-full overflow-y-hidden rounded-lg p-4 md:w-64 {className} hover:ring-2 dark:hover:ring-darkText"
	tabindex={index}
	role="button"
	id={note.id}
	aria-label={`Edit note ${index + 1}`}
	bind:this={divElement}
	{onclick}
	onkeypress={onclick}
>
	{@html note.text}
</div>

<style>
	.dragging {
		opacity: 0.5;
		background-color: transparent;
	}
</style>
