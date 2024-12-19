<script lang="ts">
	type Props = {
		height: 'h-note' | 'h-friend';
	};

	const { height }: Props = $props();
</script>

<div class="{height} animate-pulse rounded-lg bg-loading transition-all dark:bg-darkLoading"></div>
