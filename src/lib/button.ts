export type Variant = 'primary' | 'secondary' | 'ghost';

const baseClasses = `flex min-h-11 min-w-[44px] items-center justify-center gap-2 px-4 py-2 transition-all duration-150 hover:scale-105 focus:outline-hidden`;

const variantClasses = {
	primary: 'bg-primary hover:bg-primary/90 text-white border-none',
	secondary: 'bg-secondary hover:bg-secondary/90 text-white border-none',
	ghost: 'dark:hover:darkHover hover:ring-2'
} as const;

export const buildButtonClass = (variant: Variant, round = false, loading = false) => {
	const roundedClass = round ? 'rounded-full' : 'rounded-xl';
	const loadingClass = loading ? 'opacity-50 pointer-events-none' : '';
	return `${loadingClass} ${baseClasses} ${variantClasses[variant]} ${roundedClass}`;
};
