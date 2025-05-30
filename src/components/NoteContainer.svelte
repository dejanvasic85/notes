<script lang="ts">
	import { type Snippet } from 'svelte';

	type Props = { children: Snippet<[]> };

	let { children }: Props = $props();
</script>

<div class="h-note lg:w-note w-full">
	{@render children()}
</div>
