<script lang="ts">
	import Icon from './Icon.svelte';
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
	let isHovering = $state(false);

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
	class="prose h-full w-full overflow-hidden rounded-lg p-4 text-sm dark:prose-invert lg:text-base {className} relative select-none hover:cursor-grab hover:ring-2 dark:hover:ring-darkText {isDragging
		? 'opacity-50'
		: ''}"
	tabindex={index}
	role="button"
	draggable={isDraggable}
	{onclick}
	onkeypress={onclick}
	ondragstart={handleDragStart}
	ondragend={handleDragEnd}
	onmouseenter={() => (isHovering = true)}
	onmouseleave={() => (isHovering = false)}
>
	{#if isDraggable}
		<div
			class="absolute right-2 top-2 text-gray-700 dark:text-white {isHovering ? '' : 'md:hidden'}"
		>
			<Icon icon="squares-box" size={20} fill="none" title="Drag to reorder" />
		</div>
	{/if}
	{@html note.text}
</div>
