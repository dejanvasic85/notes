<script lang="ts">
	type Props = {
		height: 'h-note' | 'h-friend';
		width?: 'w-note';
	};

	const { height, width }: Props = $props();
</script>

<div
	class="{height} {width === 'w-note'
		? 'w-full lg:w-note'
		: ''} animate-pulse rounded-lg bg-loading transition-all dark:bg-darkLoading"
></div>
