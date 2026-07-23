<script lang="ts">
	import type { Snippet } from 'svelte';

	const multiClickThreshold = 1;

	function preventLabelMultiClickSelect(node: HTMLElement) {
		function handleMouseDown(event: MouseEvent) {
			if (!event.defaultPrevented && event.detail > multiClickThreshold) {
				event.preventDefault();
			}
		}

		node.addEventListener('mousedown', handleMouseDown);

		return () => node.removeEventListener('mousedown', handleMouseDown);
	}

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
