<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';
	import { MediaQuery } from 'svelte/reactivity';

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
			<!--
				No reorder animation on purpose. animate:flip only slides a move
				within one column's own keyed list, but reading order is dealt
				round-robin across N separate column arrays (see above), so a
				reorder that changes an item's column is a remove from one list
				plus an add to another — not a move Svelte can FLIP. Animating
				only the same-column case looked worse than animating nothing
				(neighbouring cards sliding while others cut), so the drop is
				instant for now. Tracked in #851.
			-->
			{#each column as entry (key(entry.value))}
				{@render item(entry.value, entry.index)}
			{/each}
		</div>
	{/each}
</div>
