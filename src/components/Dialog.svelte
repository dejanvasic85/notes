<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { scale, fade } from 'svelte/transition';
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

	let modalHeight = $state<number | null>(0);
	let resizeTimer: ReturnType<typeof setTimeout> | null = null;

	function getModalHeight(viewportHeight: number, viewportWidth: number) {
		return viewportWidth < 1024 ? viewportHeight - 80 : null;
	}

	if (typeof window !== 'undefined') {
		modalHeight = getModalHeight(window.innerHeight, window.innerWidth);
	}

	function handleResize() {
		if (resizeTimer) {
			clearTimeout(resizeTimer);
		}

		resizeTimer = setTimeout(() => {
			if (!window.visualViewport) {
				return;
			}

			modalHeight = getModalHeight(window.visualViewport.height, window.visualViewport.width);
		}, 100);
	}
</script>

<svelte:window onresize={handleResize} />

{#if $open}
	<div use:melt={$portalled} class="mx-4">
		<div
			use:melt={$overlay}
			transition:fade={{
				duration: 100
			}}
			class="z-overlay fixed inset-0 bg-black/50 backdrop-blur-xs"
		></div>
		<div
			use:melt={$content}
			transition:scale={{ duration: 100, start: 0.1 }}
			class="z-dialog
      fixed top-8 left-1/2
      mx-auto flex w-10/12
      -translate-x-1/2 flex-col
      rounded-lg shadow-lg sm:w-3/4 lg:top-1/2 lg:my-auto lg:w-1/2
			lg:-translate-y-1/2
      {className}"
			style="height: {modalHeight ? modalHeight + 'px' : '60vh'}"
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
