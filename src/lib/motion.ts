import { cubicIn, cubicInOut, cubicOut } from 'svelte/easing';
import type { TransitionConfig } from 'svelte/transition';

/*
 * Mirrors docs/design-system/tokens.css §7. Svelte's transition/animate
 * directives take JS numbers and JS easing functions, not CSS custom
 * properties, so these have to be kept in step with app.css by hand.
 */
export const durationTapMs = 100;
export const durationFastMs = 160;
export const durationBaseMs = 240;
export const durationSlowMs = 360;
export const durationSheetMs = 420;

// --ease-enter is a long decelerate (cubic-bezier(.22,1,.36,1)); cubicOut is
// the closest curve svelte/easing ships.
export const easeEnter = cubicOut;
// --ease-exit accelerates away (cubic-bezier(.4,0,1,1)); cubicIn is closest.
export const easeExit = cubicIn;
// --ease-move travels between two known states (cubic-bezier(.65,0,.35,1));
// cubicInOut is closest, and is already what the friends-page tab indicator
// uses for the same kind of move.
export const easeMove = cubicInOut;

const boardStaggerMs = 30;
const boardStaggerCap = 8;

// Board load: staggered 30ms in reading order, capped at 8 so a long board
// doesn't take seconds to finish revealing itself.
export function boardEnterDelayMs(index: number): number {
	return Math.min(index, boardStaggerCap - 1) * boardStaggerMs;
}

export type OriginRect = {
	top: number;
	left: number;
	width: number;
	height: number;
};

type GrowParams = {
	origin: OriginRect | null;
	direction: 'in' | 'out';
};

const rootStyle = () => getComputedStyle(document.documentElement);

/*
 * Grows the sheet out of the note card it opened from — the card's colour
 * and radius expand into the sheet rather than a panel flying over it (see
 * docs/design-system §7, "Open a note"). Without an origin rect (e.g. a note
 * opened by deep link, with no card ever clicked) it falls back to a plain
 * fade, since there is nothing to grow from.
 */
export function growFromOrigin(node: Element, { origin, direction }: GrowParams): TransitionConfig {
	const duration = direction === 'in' ? durationSheetMs : durationBaseMs;
	const easing = direction === 'in' ? easeEnter : easeExit;

	if (!origin) {
		return {
			duration,
			easing,
			css: (t) => `opacity: ${t}`
		};
	}

	const target = node.getBoundingClientRect();
	const targetStyle = getComputedStyle(node);
	const originRadius = rootStyle().getPropertyValue('--radius-card').trim() || '18px';

	const dx = origin.left - target.left;
	const dy = origin.top - target.top;
	const sx = target.width === 0 ? 1 : origin.width / target.width;
	const sy = target.height === 0 ? 1 : origin.height / target.height;

	const corners = [
		'borderTopLeftRadius',
		'borderTopRightRadius',
		'borderBottomRightRadius',
		'borderBottomLeftRadius'
	] as const;
	const targetRadii = corners.map((corner) => targetStyle[corner]);

	return {
		duration,
		easing,
		css: (_, u) => {
			// u runs 1 -> 0 across both intro and outro, so it always reads as
			// "how much of the origin card's geometry is left to apply".
			const p = u;
			const scaleX = 1 + (sx - 1) * p;
			const scaleY = 1 + (sy - 1) * p;
			const radius = targetRadii
				.map((targetRadius) => `calc(${targetRadius} + (${originRadius} - ${targetRadius}) * ${p})`)
				.join(' ');

			return `
				transform-origin: top left;
				transform: translate(${dx * p}px, ${dy * p}px) scale(${scaleX}, ${scaleY});
				border-radius: ${radius};
			`;
		}
	};
}
