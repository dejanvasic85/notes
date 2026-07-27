<script lang="ts">
	import { getNoteCssClass } from '$lib/colours';
	import { formatNoteDate } from '$lib/noteDate';
	import { getNotePreview } from '$lib/notePreview';
	import type { NoteOrdered, Friend } from '$lib/types';
	import { GripVertical } from '@lucide/svelte';

	import UserAvatar from './UserAvatar.svelte';

	type Props = {
		note: NoteOrdered;
		index: number;
		isDraggable?: boolean;
		friends?: Friend[];
		onclick: () => void;
		ondragstart?: (index: number) => void;
		ondragend?: () => void;
	};

	// The preview is capped rather than clamped so long notes fade out; below
	// this much overflow the fade would be doing nothing worth the mask.
	const clipThresholdPx = 4;
	const avatarSize = 6;
	const labelPreviewLimit = 80;

	let {
		note,
		index,
		friends = [],
		isDraggable = true,
		onclick,
		ondragstart,
		ondragend
	}: Props = $props();

	let isDragging = $state(false);
	let isHovering = $state(false);
	let previewElement: HTMLParagraphElement | null = $state(null);
	let isClipped = $state(false);

	let editors = $derived(
		friends.filter((f) => note.editors?.some((e) => e.userId === f.id && e.selected))
	);

	const className = $derived(getNoteCssClass({ colour: note.colour ?? '' }));
	const dateLabel = $derived(formatNoteDate(note.updatedAt ?? note.createdAt));
	const previewText = $derived(getNotePreview(note.textPlain, note.text));
	const isEmpty = $derived(!note.title && !previewText);
	const hasFooter = $derived(note.shared || editors.length > 0);

	/*
	 * A role="button" element has presentational children, so none of the text
	 * rendered below reaches the accessibility tree — the label has to carry
	 * the note's identity itself, not just its position on the board.
	 */
	const accessibleLabel = $derived(
		[
			`Edit note ${index + 1}`,
			note.title || previewText.slice(0, labelPreviewLimit) || 'Empty note',
			dateLabel,
			hasFooter ? 'Shared' : ''
		]
			.filter(Boolean)
			.join(', ')
	);

	/*
	 * The mask only goes on when the preview actually overflows — applied
	 * unconditionally it would fade the last line of every short note too.
	 * Reading previewText makes this re-measure when the note text changes,
	 * which a ResizeObserver alone would miss once the box is at max height.
	 */
	$effect(() => {
		const element = previewElement;
		if (!element || !previewText) {
			isClipped = false;
			return;
		}

		const observer = new ResizeObserver(() => {
			isClipped = element.scrollHeight - element.clientHeight > clipThresholdPx;
		});
		observer.observe(element);
		return () => observer.disconnect();
	});

	function handleDragStart(event: DragEvent) {
		event.dataTransfer?.setData('text/plain', index.toString());
		isDragging = true;
		ondragstart?.(index);
	}

	function handleDragEnd() {
		isDragging = false;
		ondragend?.();
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			onclick();
		}
	}
</script>

<div
	id={note.id}
	aria-label={accessibleLabel}
	class="rounded-card shadow-card hover:shadow-lifted w-full break-words select-none hover:cursor-grab {className} p-3.5 lg:p-4 {isDragging
		? 'opacity-50'
		: ''}"
	tabindex="0"
	role="button"
	draggable={isDraggable}
	{onclick}
	onkeydown={handleKeyDown}
	ondragstart={handleDragStart}
	ondragend={handleDragEnd}
	onmouseenter={() => (isHovering = true)}
	onmouseleave={() => (isHovering = false)}
>
	<div class="flex items-start justify-between gap-2">
		{#if dateLabel}
			<p class="text-label text-ink-muted uppercase">{dateLabel}</p>
		{/if}
		{#if isDraggable}
			<!--
				Faded rather than hidden so revealing it on hover cannot change
				the card's height and jitter the column below it.
			-->
			<div class="text-ink-muted -mt-1 ml-auto shrink-0 {isHovering ? '' : 'md:opacity-0'}">
				<GripVertical size={18} aria-hidden="true" />
			</div>
		{/if}
	</div>

	{#if note.title}
		<h3 class="text-heading mt-1 line-clamp-2">{note.title}</h3>
	{/if}

	{#if previewText}
		<p
			bind:this={previewElement}
			class="text-small text-ink-muted mt-1 max-h-40 overflow-hidden whitespace-pre-line {isClipped
				? 'mask-b-from-65%'
				: ''}"
		>
			{previewText}
		</p>
	{:else if isEmpty}
		<!--
			text-ink-faint is the documented placeholder colour, but it is only
			verified against canvas/paper/raised — on the note pastels it drops
			to 4.02:1. The italic carries the placeholder meaning instead.
		-->
		<p class="text-small text-ink-muted mt-1 italic">Empty note</p>
	{/if}

	{#if hasFooter}
		<div class="mt-3 flex items-center gap-1.5">
			{#if note.shared}
				<UserAvatar
					size={avatarSize}
					picture={note.owner.picture || ''}
					name={note.owner.name || ''}
				/>
			{/if}
			{#each editors as editor (editor.id)}
				<UserAvatar size={avatarSize} picture={editor.picture || ''} name={editor.name || ''} />
			{/each}
			<!--
				The chip tints whatever note colour is underneath rather than
				using a fixed surface token, so it works on all six pastels.
				text-ink, not text-ink-muted: muted on the tinted pastels falls
				to 3.65:1 in dark mode.
			-->
			<span class="text-label bg-ink/10 text-ink rounded-chip ml-1 px-2 py-0.5 uppercase">
				Shared
			</span>
		</div>
	{/if}
</div>
