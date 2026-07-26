<script lang="ts">
	type Props = { heightClass?: string };

	let { heightClass = 'h-32' }: Props = $props();
</script>

<div class="bg-line-soft rounded-card w-full animate-pulse {heightClass}"></div>
