<script lang="ts">
	import { createAvatar, createTooltip, melt } from '@melt-ui/svelte';

	type Props = {
		picture: string;
		name: string;
		size?: 5 | 6 | 7 | 8;
	};

	const { picture, name, size = 5 }: Props = $props();

	const {
		elements: { image }
	} = createAvatar({
		src: picture
	});

	const {
		elements: { trigger, content, arrow },
		states: { open }
	} = createTooltip({
		positioning: {
			placement: 'top'
		},
		openDelay: 0,
		closeDelay: 0,
		closeOnPointerDown: false,
		forceVisible: true
	});

	const sizeMap = {
		5: 'size-5',
		6: 'size-6',
		7: 'size-7',
		8: 'size-8'
	};
</script>

<img
	class="m-0 rounded-full ring-2 ring-white {sizeMap[size]}"
	use:melt={$image}
	use:melt={$trigger}
	alt={`Avatar of ${name}`}
/>

{#if $open}
	<div use:melt={$content} class="z-toaster rounded-lg bg-black shadow">
		<div use:melt={$arrow}></div>
		<p class="p-4 text-sm text-white">{name}</p>
	</div>
{/if}
