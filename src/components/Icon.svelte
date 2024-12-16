<script lang="ts">
	import { type IconName, icons } from '$lib/icons';

	type Props = {
		icon: IconName;
		size?: number;
		title?: string;
		fill?: 'currentColor' | 'none';
		stroke?: 'currentColor' | 'none';
	};

	let { icon, size = 24, title, fill = 'currentColor', stroke = 'currentColor' }: Props = $props();

	const paths = Array.isArray(icons[icon].path)
		? (icons[icon].path as string[])
		: ([icons[icon].path] as string[]);
</script>

<svg
	viewBox={icons[icon].viewBox}
	height={size}
	width={size}
	focusable="false"
	role="img"
	{fill}
	{stroke}
	stroke-width="1.6"
	><title>{title}</title>

	{#each paths as path}
		<path d={path} />
	{/each}
</svg>
