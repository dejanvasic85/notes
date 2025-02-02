<script lang="ts">
	import { type Snippet } from 'svelte';

	type Props = { children: Snippet<[]> };

	let { children }: Props = $props();
</script>

<div class="grid grid-cols-2 flex-wrap items-stretch gap-4 lg:flex lg:gap-8" role="list">
	{@render children()}
</div>
