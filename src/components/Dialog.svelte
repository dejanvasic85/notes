<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { createDialog, melt } from '@melt-ui/svelte';

	import { type Colour, colours } from '$lib/colours';

	type Props = {
		header: Snippet<[]>;
		body: Snippet<[]>;
		footer?: Snippet<[]>;
		show: boolean;
		colour?: Colour | null;
		onopen?: () => void;
	};

	const {
		header,
		body,
		footer,
		show = $bindable(false),
		colour = $bindable(null),
		onopen
	}: Props = $props();

	const className = $derived(
		colours.find((c) => c.name === colour)?.cssClass ??
			'bg-white dark:bg-dark dark:text-dark-text border'
	);

	const dialog = createDialog({
		preventScroll: true,
		escapeBehavior: 'ignore',
		closeOnOutsideClick: false
	});

	const {
		elements: { portalled, overlay, content },
		states: { open }
	} = dialog;

	onMount(() => {
		if (typeof window !== 'undefined') {
			window.visualViewport?.addEventListener('resize', handleResize);
		}
		$open = show;
		onopen?.();
	});

	let isDesktop = $state<boolean>(false);
	let resizeTimer: ReturnType<typeof setTimeout> | null = null;

	if (typeof window !== 'undefined') {
		isDesktop = window.innerWidth >= 1024;
	}

	function handleResize() {
		if (resizeTimer) {
			clearTimeout(resizeTimer);
		}

		resizeTimer = setTimeout(() => {
			if (!window.visualViewport) {
				return;
			}

			isDesktop = window.visualViewport.width >= 1024;
		}, 100);
	}
</script>

<svelte:window onresize={handleResize} />

{#if $open}
	<div use:melt={$portalled}>
		<div
			use:melt={$overlay}
			transition:fade={{
				duration: 150
			}}
			class="z-overlay fixed inset-0 bg-black/50 backdrop-blur-xs"
		></div>
		<div
			use:melt={$content}
			transition:fly={{
				duration: 200,
				y: isDesktop ? 0 : 400,
				x: isDesktop ? 400 : 0
			}}
			class="z-dialog fixed flex flex-col shadow-lg {className}
				{isDesktop
				? 'top-0 right-0 h-screen w-4/5 rounded-l-lg'
				: 'right-0 bottom-0 left-0 h-[90vh] rounded-t-lg'}"
		>
			<!-- header -->
			<div>
				{@render header()}
			</div>

			<!-- body -->
			<div class="w-full flex-1 overflow-y-auto shadow-lg">
				{@render body()}
			</div>

			<!-- footer -->
			<div>
				{@render footer?.()}
			</div>
		</div>
	</div>
{/if}
