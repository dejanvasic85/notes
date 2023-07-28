export const colours = [
	{ name: 'slate', cssClass: 'bg-slate-200 dark:bg-slate-800' },
	{ name: 'indigo', cssClass: 'bg-indigo-200 dark:bg-indigo-800' },
	{ name: 'blue', cssClass: 'bg-blue-200 dark:bg-blue-800' },
	{ name: 'rose', cssClass: 'bg-rose-200 dark:bg-rose-800' },
	{ name: 'amber', cssClass: 'bg-amber-200 dark:bg-amber-800' },
	{ name: 'teal', cssClass: 'bg-teal-200 dark:bg-teal-800' },
	{ name: 'fuchsia', cssClass: 'bg-fuchsia-200 dark:bg-fuchsia-800' }
];

export type Colour = (typeof colours)[number]['name'];

interface GetNoteCssClass {
	variant?: Colour;
	defaultClass: string;
}

export function getNoteCssClass({ defaultClass, variant }: GetNoteCssClass) {
	const colour = colours.find((c) => c.name === variant);
	return colour ? `${colour.cssClass} dark:text-white border` : defaultClass;
}
