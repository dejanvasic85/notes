<script lang="ts">
	import { createDialog, melt } from '@melt-ui/svelte';
	import { scale, fade } from 'svelte/transition';
	import type { Snippet } from 'svelte';

	const {
		elements: { portalled, overlay, content },
		states: { open }
	} = createDialog({ preventScroll: true, closeOnOutsideClick: false });

	type Props = {
		className?: string;
		header: Snippet<[]>;
		body: Snippet<[]>;
		footer: Snippet<[]>;
		show: boolean;
		onclose: () => void;
	};

	let { className = '', show = $bindable(false), header, body, footer, onclose }: Props = $props();

	$effect(() => {
		$open = show;
	});

	$effect(() => {
		if (!$open) {
			onclose();
		}
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

<svelte:window on:resize={handleResize} />

{#if $open}
	<div use:melt={$portalled} class="mx-4">
		<div
			use:melt={$overlay}
			transition:fade={{
				duration: 100
			}}
			class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
		></div>
		<div
			use:melt={$content}
			transition:scale={{ duration: 100, start: 0.1 }}
			class="fixed left-1/2 top-1/2 z-50 mx-auto my-4 flex w-10/12 -translate-x-1/2 -translate-y-1/2 flex-col rounded-lg bg-white p-6 shadow-lg sm:w-3/4 lg:my-auto lg:w-1/2 {className}"
			style="height: {modalHeight ? modalHeight + 'px' : '60vh'}"
		>
			<!-- header -->
			<div>
				{@render header()}
			</div>

			<!-- body -->
			<div class="w-full flex-1 overflow-y-auto">
				{@render body()}
			</div>

			<!-- footer -->
			<div>
				{@render footer()}
			</div>
		</div>
	</div>
{/if}
