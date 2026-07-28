<script lang="ts">
	import { getNoteCssClass } from '$lib/colours';
	import { formatNoteDate } from '$lib/noteDate';
	import { getNotePreview } from '$lib/notePreview';
	import type { NoteOrdered, Friend, UserProfile } from '$lib/types';
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
	// Beyond three faces the stack eats the whole footer of a mobile column,
	// so the rest collapse into a count.
	const maxVisibleAvatars = 3;

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
	 * The owner leads the stack on a note shared with you, so the face you see
	 * first is whose note it is. Deduped because an owner who is also a
	 * selected editor would otherwise repeat a key in the each block — first
	 * occurrence wins so the owner's own profile stays authoritative over the
	 * possibly staler snapshot in the friend list.
	 */
	const sharedWith = $derived<UserProfile[]>(
		(note.shared ? [note.owner, ...editors] : editors).filter(
			(person, index, all) => all.findIndex((other) => other.id === person.id) === index
		)
	);
	const visibleAvatars = $derived(sharedWith.slice(0, maxVisibleAvatars));
	const overflowCount = $derived(sharedWith.length - visibleAvatars.length);
	// The +N badge is decorative, so the count only reaches assistive tech
	// through the card's own label.
	const sharedLabel = $derived(
		sharedWith.length > 0
			? `Shared with ${sharedWith.length} ${sharedWith.length === 1 ? 'person' : 'people'}`
			: ''
	);

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
			sharedLabel
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
		<!--
			Wrapping rather than shrinking: on a narrow column the chip drops to
			its own line instead of squeezing the faces into ovals.
		-->
		<div class="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5">
			<!-- Overlapped so a fourth person costs 18px, not a whole avatar. -->
			<div class="flex shrink-0 items-center -space-x-2">
				{#each visibleAvatars as person (person.id)}
					<UserAvatar size={avatarSize} picture={person.picture || ''} name={person.name || ''} />
				{/each}
				{#if overflowCount > 0}
					<span
						class="text-label bg-ink/10 text-ink ring-paper flex size-6 shrink-0 items-center justify-center rounded-full pl-1 ring-2"
						aria-hidden="true"
					>
						+{overflowCount}
					</span>
				{/if}
			</div>
			<!--
				The chip tints whatever note colour is underneath rather than
				using a fixed surface token, so it works on all six pastels.
				text-ink, not text-ink-muted: muted on the tinted pastels falls
				to 3.65:1 in dark mode.
			-->
			<span class="text-label bg-ink/10 text-ink rounded-chip shrink-0 px-2 py-0.5 uppercase">
				Shared
			</span>
		</div>
	{/if}
</div>
