<script lang="ts">
	import type { Snippet } from 'svelte';

	import { preventLabelMultiClickSelect } from '$lib/preventLabelMultiClickSelect';

	type Props = {
		for: string;
		invalid?: boolean;
		children: Snippet<[]>;
	};

	const { for: htmlFor, invalid = false, children }: Props = $props();
</script>

<label for={htmlFor} class:text-error={invalid} {@attach preventLabelMultiClickSelect}>
	{@render children()}
</label>
