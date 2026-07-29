<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';
	import { flip } from 'svelte/animate';
	import { MediaQuery } from 'svelte/reactivity';

	import { durationBaseMs, easeMove } from '$lib/motion';

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
				<div animate:flip={{ duration: durationBaseMs, easing: easeMove }}>
					{@render item(entry.value, entry.index)}
				</div>
			{/each}
		</div>
	{/each}
</div>
