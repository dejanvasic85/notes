<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { fade } from 'svelte/transition';
	import { MediaQuery } from 'svelte/reactivity';
	import { Dialog as BitsDialog } from 'bits-ui';

	import { type Colour, colours } from '$lib/colours';
	import {
		durationBaseMs,
		durationFastMs,
		easeEnter,
		easeExit,
		reduceMotion,
		sheetTransition
	} from '$lib/motion';
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
		onclose?: () => void;
	};

	const floatingGap = '0.5rem';
	/*
	 * Matches the `lg:` breakpoint the panel's own geometry switches at, so the
	 * drawer motion and the side-panel shape always agree about which layout is
	 * in effect. MediaQuery (not a hand-rolled matchMedia) so it resolves to the
	 * mobile default during SSR and re-evaluates on the client; the transition
	 * itself only ever runs after mount, by which point it is accurate.
	 */
	const desktopQuery = new MediaQuery('min-width: 64rem');
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
		onopen,
		onclose
	}: Props = $props();

	const className = $derived(colours.find((c) => c.name === colour)?.cssClass ?? 'bg-paper border');

	/*
	 * bits-ui's `open` is already true on this component's very first render —
	 * a fresh Dialog instance is created the moment a note is selected, with
	 * `show` true from the start. Svelte only plays an intro when a block's
	 * condition flips from false to true; a condition that's true on its very
	 * first evaluation is treated as "already there", so both the intro and
	 * (since it was never properly registered) the later outro silently no-op.
	 * Gating on `open && isPresent`, where `isPresent` starts false and flips
	 * true one tick after mount (via the effect below, once `hasMounted`),
	 * gives Svelte that genuine flip to animate.
	 *
	 * The same problem hits closing from the other direction: the consumer
	 * unmounts this whole component (Board's `{#if selectedNote}`) as soon as
	 * it decides to close, which tears down this subtree before a nested
	 * block's own outro would ever get a chance to run. So closing doesn't
	 * call `onclose` directly — it sets `show` false, which this effect turns
	 * into a genuine local `isPresent` true->false flip, correctly animating
	 * the still-mounted elements. Syncing both directions (not just false)
	 * also means a `show` that goes back to true on an already-mounted
	 * instance — not exercised by NoteEditor today, but not ruled out by this
	 * component's own contract either — re-opens instead of staying stuck.
	 *
	 * The real `onclose` only fires once the exit animation actually
	 * finishes, via the panel's own `onoutroend` below — not a timer guessing
	 * the duration, which would drift from reality under
	 * `prefers-reduced-motion` (the CSS override collapses the real animation
	 * to ~0ms, but a JS timer sized for the un-reduced duration wouldn't know
	 * that, so closing would visually finish instantly while the app kept
	 * treating the note as still open for another 240ms).
	 */
	let isPresent = $state(false);
	// Plain, not $state: read inside the effect below to gate it without
	// becoming one of its own dependencies. isPresent itself must stay out of
	// that effect's reads too — an effect that both reads and writes the same
	// state reruns itself the instant it writes, and Svelte would call this
	// effect's own cleanup (if it had one) before that rerun.
	let hasMounted = false;

	$effect(() => {
		/*
		 * `show` is read before the guard on purpose. Returning first would end
		 * the run without ever reading it, so Svelte would register no dependency
		 * on it and never re-run this effect — and the first run always lands
		 * before onMount, since effects fire in creation order and this one is
		 * declared above it. That left a Dialog mounted with `show` false stuck
		 * closed forever, which every caller happened to avoid by mounting a
		 * fresh instance with `show` already true.
		 */
		const nextPresent = show;
		if (!hasMounted) return;
		isPresent = nextPresent;
	});

	function handlePanelOutroEnd() {
		if (!show) {
			onclose?.();
		}
	}

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
		hasMounted = true;
		isPresent = show;

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
				{#if open && isPresent}
					<div
						{...props}
						in:fade={{ duration: reduceMotion(durationBaseMs), easing: easeEnter }}
						out:fade={{ duration: reduceMotion(durationFastMs), easing: easeExit }}
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
				{#if open && isPresent}
					<div
						{...props}
						in:sheetTransition={{
							origin: originRect,
							direction: 'in',
							drawer: desktopQuery.current
						}}
						out:sheetTransition={{
							origin: originRect,
							direction: 'out',
							drawer: desktopQuery.current
						}}
						onoutroend={handlePanelOutroEnd}
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
