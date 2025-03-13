<script lang="ts">
	import { getNoteCssClass } from '$lib/colours';
	import type { NoteOrdered, Friend } from '$lib/types';

	import Icon from './Icon.svelte';
	import UserAvatar from './UserAvatar.svelte';

	type Props = {
		note: NoteOrdered;
		index: number;
		isDraggable?: boolean;
		friends?: Friend[];
		onclick: () => void;
	};

	let { note, index, friends = [], isDraggable = true, onclick }: Props = $props();
	let isDragging = $state(false);
	let isHovering = $state(false);
	let editors = $derived(
		friends.filter((f) => note.editors?.some((e) => e.userId === f.id && e.selected))
	);

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
	class="prose h-full w-full overflow-hidden rounded-lg p-4 text-sm dark:prose-invert lg:text-base {className} relative select-none break-words hover:cursor-grab hover:ring-2 dark:hover:ring-darkText {isDragging
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

	{#if note.shared || editors.length > 0}
		<div
			class="absolute bottom-0 left-0 flex h-10 w-full items-center gap-2 bg-white/20 px-4 backdrop-blur-sm"
		>
			{#if note.shared}
				<UserAvatar picture={note.owner.picture || ''} name={note.owner.name || ''} />
			{/if}
			{#each editors as editor}
				<UserAvatar picture={editor.picture || ''} name={editor.name || ''} />
			{/each}
		</div>
	{/if}
</div>
