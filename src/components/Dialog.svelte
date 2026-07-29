<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { fade } from 'svelte/transition';
	import { Dialog as BitsDialog } from 'bits-ui';

	import { type Colour, colours } from '$lib/colours';
	import { durationBaseMs, durationFastMs, easeEnter, easeExit, growFromOrigin } from '$lib/motion';
	import type { OriginRect } from '$lib/motion';

	type Props = {
		header: Snippet<[]>;
		body: Snippet<[]>;
		footer?: Snippet<[]>;
		floating?: Snippet<[]>;
		show: boolean;
		colour?: Colour | null;
		originRect?: OriginRect | null;
		onopen?: () => void;
	};

	const floatingGap = '0.5rem';
	/*
	 * The keyboard maths below only describes a keyboard while the page sits at
	 * its natural scale — pinch-zoom shrinks the visual viewport for reasons
	 * that have nothing to do with one.
	 */
	const scaleTolerance = 0.01;

	let {
		header,
		body,
		footer,
		floating,
		show = $bindable(false),
		colour = $bindable(null),
		originRect = null,
		onopen
	}: Props = $props();

	const className = $derived(colours.find((c) => c.name === colour)?.cssClass ?? 'bg-paper border');

	let footerHeight = $state(0);
	let keyboardInset = $state(0);
	let frame: number | null = null;

	/*
	 * Where the floating layer sits: clear of the footer when the keyboard is
	 * closed, clear of the keyboard when it is open, whichever is higher. Built
	 * here rather than inline so the expression can't be wrapped mid-calc().
	 */
	const floatingOffset = $derived(
		`calc(max(${footerHeight}px + env(safe-area-inset-bottom), ${keyboardInset}px) + ${floatingGap})`
	);

	/*
	 * How much of the layout viewport the software keyboard covers. Both iOS
	 * Safari and Android Chrome default to `resizes-visual`, leaving
	 * innerHeight at its full size while the visual viewport shrinks, so the
	 * difference is the keyboard. Where a browser resizes the layout viewport
	 * instead this yields 0, which is also correct — the sheet has already
	 * shrunk with it.
	 */
	function readKeyboardInset() {
		const viewport = window.visualViewport;
		if (!viewport || Math.abs(viewport.scale - 1) > scaleTolerance) {
			return 0;
		}

		return Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
	}

	// Coalesced onto a frame rather than debounced: a keyboard animates open in
	// ~250ms and a trailing debounce leaves the toolbar visibly lagging behind it.
	function handleViewportChange() {
		if (frame !== null) {
			return;
		}

		frame = requestAnimationFrame(() => {
			frame = null;
			keyboardInset = readKeyboardInset();
		});
	}

	onMount(() => {
		const viewport = window.visualViewport;
		viewport?.addEventListener('resize', handleViewportChange);
		// iOS fires scroll, not resize, when the visual viewport merely shifts.
		viewport?.addEventListener('scroll', handleViewportChange);
		keyboardInset = readKeyboardInset();

		if (show) {
			onopen?.();
		}

		return () => {
			viewport?.removeEventListener('resize', handleViewportChange);
			viewport?.removeEventListener('scroll', handleViewportChange);
			if (frame !== null) {
				cancelAnimationFrame(frame);
			}
		};
	});
</script>

<BitsDialog.Root bind:open={show}>
	<BitsDialog.Portal>
		<BitsDialog.Overlay forceMount>
			{#snippet child({ props, open })}
				{#if open}
					<div
						{...props}
						in:fade={{ duration: durationBaseMs, easing: easeEnter }}
						out:fade={{ duration: durationFastMs, easing: easeExit }}
						class="z-overlay fixed inset-0 bg-black/50 backdrop-blur-xs"
					></div>
				{/if}
			{/snippet}
		</BitsDialog.Overlay>
		<BitsDialog.Content
			forceMount
			escapeKeydownBehavior="ignore"
			interactOutsideBehavior="ignore"
			preventScroll={true}
		>
			{#snippet child({ props, open })}
				{#if open}
					<div
						{...props}
						in:growFromOrigin={{ origin: originRect, direction: 'in' }}
						out:growFromOrigin={{ origin: originRect, direction: 'out' }}
						class="z-dialog shadow-sheet rounded-t-sheet lg:rounded-l-sheet fixed right-0 bottom-0 left-0 flex h-[90dvh] flex-col pb-[env(safe-area-inset-bottom)] lg:top-0 lg:bottom-auto lg:left-auto lg:h-dvh lg:w-4/5 lg:max-w-3xl lg:rounded-t-none {className}"
					>
						<!-- header -->
						<div>
							{@render header()}
						</div>

						<!-- body — padded so the floating toolbar never sits over the caret -->
						<div class="w-full flex-1 overflow-y-auto {floating ? 'pb-20' : ''}">
							{@render body()}
						</div>

						<!-- footer -->
						<div bind:clientHeight={footerHeight}>
							{@render footer?.()}
						</div>

						<!-- Floating layer — see floatingOffset for the positioning. -->
						{#if floating}
							<div
								class="pointer-events-none absolute inset-x-0 flex justify-center px-4"
								style:bottom={floatingOffset}
							>
								{@render floating()}
							</div>
						{/if}
					</div>
				{/if}
			{/snippet}
		</BitsDialog.Content>
	</BitsDialog.Portal>
</BitsDialog.Root>
