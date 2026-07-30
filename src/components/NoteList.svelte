<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';
	import { MediaQuery } from 'svelte/reactivity';

	import { durationBaseMs, easeMove, reduceMotion } from '$lib/motion';

	type Props = {
		items: T[];
		item: Snippet<[T, number]>;
		key: (item: T) => string | number;
	};

	const narrowColumnCount = 2;
	const mediumColumnCount = 3;
	const wideColumnCount = 4;

	let { items, item, key }: Props = $props();

	/*
	 * Columns are built here rather than with CSS `columns` because the board
	 * is a drag-ordered list. CSS columns fill top-to-bottom down one column
	 * before starting the next, so the visual position of a card would not
	 * match its index and a drop would land somewhere the user didn't aim.
	 * Dealing the cards round-robin keeps reading order left-to-right.
	 */
	const isMedium = new MediaQuery('min-width: 48rem');
	const isWide = new MediaQuery('min-width: 80rem');

	let columnCount = $derived(
		isWide.current ? wideColumnCount : isMedium.current ? mediumColumnCount : narrowColumnCount
	);

	let columns = $derived.by(() => {
		const dealt: { value: T; index: number }[][] = Array.from({ length: columnCount }, () => []);
		items.forEach((value, index) => dealt[index % columnCount].push({ value, index }));
		return dealt;
	});
</script>

<div class="flex items-start gap-3 lg:gap-4">
	{#each columns as column, columnIndex (columnIndex)}
		<div class="flex min-w-0 flex-1 flex-col gap-3 lg:gap-4" role="list">
			{#each column as entry (key(entry.value))}
				<!--
					animate:flip only slides a move within this one column's own
					keyed list. Reading order is dealt round-robin across N separate
					column arrays (see above), so a reorder that changes which column
					an item lands in is a remove from one list and an add to another,
					not a move Svelte can FLIP — content-sized masonry columns rule out
					a single flat list here (see #826). in/out fade keeps that case a
					soft cross-fade instead of a hard jump.
				-->
				<div
					animate:flip={{ duration: reduceMotion(durationBaseMs), easing: easeMove }}
					in:fade={{ duration: reduceMotion(durationBaseMs), easing: easeMove }}
					out:fade={{ duration: reduceMotion(durationBaseMs), easing: easeMove }}
				>
					{@render item(entry.value, entry.index)}
				</div>
			{/each}
		</div>
	{/each}
</div>
