export type Variant = 'primary' | 'secondary' | 'tertiary' | 'ghost';

const baseClasses = `flex
	min-h-11
	min-w-[44px]
	items-center
	justify-center
	gap-2
	px-4 py-2
	transition-all
	duration-150
	hover:scale-105
	focus:outline-none`;

const variantClasses = {
	primary: 'bg-primary hover:bg-primary/90 text-white border-none',
	secondary: 'bg-secondary hover:bg-secondary/90 text-white border-none',
	tertiary: 'bg-tertiary hover:bg-tertiary/90 text-white border-none',
	ghost: 'dark:hover:bg-slate-800 hover:ring-2'
} as const;

export const buildButtonClass = (variant: Variant, round = false) => {
	const roundedClass = round ? 'rounded-full' : 'rounded-xl';
	return `${baseClasses} ${variantClasses[variant]} ${roundedClass}`;
};
