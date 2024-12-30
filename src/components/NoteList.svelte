<script lang="ts">
	import { type Snippet } from 'svelte';

	type Props = { children: Snippet<[]> };

	let { children }: Props = $props();
</script>

<div class="flex flex-wrap items-stretch gap-6" role="list">
	{@render children()}
</div>
