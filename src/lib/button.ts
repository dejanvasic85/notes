export type Variant = 'primary' | 'secondary' | 'ghost';
export type Size = 'sm' | 'md';

const baseClasses = `flex items-center justify-center gap-2 transition-all duration-150 hover:scale-105 focus:outline-hidden`;

const sizeClasses = {
	sm: 'min-h-8 min-w-8 p-1.5',
	md: 'min-h-11 min-w-[44px] px-4 py-2'
} as const;

const variantClasses = {
	primary: 'bg-primary hover:bg-primary/90 text-white border-none',
	secondary: 'bg-secondary hover:bg-secondary/90 text-white border-none',
	ghost: 'dark:hover:darkHover hover:ring-2'
} as const;

export const buildButtonClass = (
	variant: Variant,
	round = false,
	loading = false,
	active = false,
	size: Size = 'md'
) => {
	const roundedClass = round ? 'rounded-full' : 'rounded-xl';
	const loadingClass = loading ? 'opacity-50 pointer-events-none' : '';
	const activeClass = active ? 'ring-2 ring-primary bg-primary/10' : '';
	return `${loadingClass} ${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${roundedClass} ${activeClass}`;
};
