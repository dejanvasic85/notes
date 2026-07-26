export type Variant = 'primary' | 'quiet' | 'ghost' | 'danger';
export type Size = 'sm' | 'md';

const baseClasses = `flex items-center justify-center gap-2 transition-colors duration-150`;

const sizeClasses = {
	sm: 'min-h-8 min-w-8 p-1.5',
	md: 'min-h-11 min-w-[44px] px-4 py-2'
} as const;

/*
 * Hover shifts background rather than scale. The old scale-on-hover made
 * adjacent controls jitter and did nothing for keyboard users.
 *
 * `text-on-accent` is never `text-white`: the dark-mode accent is a light
 * violet where white drops to 3.5:1. Same for danger.
 */
const variantClasses = {
	primary: 'bg-accent hover:bg-accent-strong text-on-accent border-none',
	quiet: 'bg-paper hover:bg-accent-soft text-ink border border-line hover:border-accent-ring',
	ghost: 'text-ink-muted hover:bg-accent-soft hover:text-accent-strong',
	danger: 'text-danger border border-line hover:bg-danger hover:text-on-danger hover:border-danger'
} as const;

export const buildButtonClass = (
	variant: Variant,
	round = false,
	loading = false,
	active = false,
	size: Size = 'md'
) => {
	const roundedClass = round ? 'rounded-full' : 'rounded-control';
	const loadingClass = loading ? 'opacity-50 pointer-events-none' : '';
	const activeClass = active ? 'bg-accent-soft text-accent-strong' : '';
	return `${loadingClass} ${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${roundedClass} ${activeClass}`;
};
