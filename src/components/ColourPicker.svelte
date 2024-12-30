<script lang="ts">
	import { slide } from 'svelte/transition';
	import { createDropdownMenu, melt } from '@melt-ui/svelte';

	import { colours, type Colour } from '$lib/colours';

	import Button from './Button.svelte';
	import Icon from './Icon.svelte';

	type Props = {
		onselect: (colour: Colour | null) => void;
	};

	let { onselect }: Props = $props();

	const {
		elements: { trigger, menu, item },
		states: { open }
	} = createDropdownMenu({
		forceVisible: true,
		loop: true,
		preventScroll: true,
		closeOnOutsideClick: true,
		positioning: { placement: 'bottom' },
		onOutsideClick: () => {
			$open = false;
		}
	});

	function handleColourClick(colour: Colour | null) {
		onselect(colour);
	}
</script>

<div use:melt={$trigger}>
	<Button variant="ghost">
		<Icon icon="paint-brush" title="Choose colour" fill="none" />
	</Button>
</div>
{#if $open}
	<div class="flex flex-col gap-1 bg-transparent" in:slide={{ duration: 100 }} use:melt={$menu}>
		<div class="block" use:melt={$item}>
			<button
				aria-label="No colour"
				class="flex h-12 w-12 items-center justify-center rounded-full border-2 border-slate-400 bg-white text-gray-600 dark:border-slate-200 dark:bg-dark"
				onclick={() => handleColourClick(null)}
			>
				<Icon icon="minus" size={30} fill="none" title="No colour" />
			</button>
		</div>
		{#each colours as { cssClass, name }}
			<div class="block" use:melt={$item}>
				<button
					aria-label={name}
					title={name}
					class="h-12 w-12 rounded-full border-2 border-slate-400 dark:border dark:border-slate-200 {cssClass}"
					onclick={() => handleColourClick(name)}
				></button>
			</div>
		{/each}
	</div>
{/if}
