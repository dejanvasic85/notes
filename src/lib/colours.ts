export const colours = [
	{ name: 'indigo', cssClass: 'bg-indigo-100 dark:bg-indigo-700' },
	{ name: 'blue', cssClass: 'bg-blue-100 dark:bg-blue-700' },
	{ name: 'rose', cssClass: 'bg-rose-100 dark:bg-rose-700' },
	{ name: 'amber', cssClass: 'bg-amber-100 dark:bg-amber-700' },
	{ name: 'teal', cssClass: 'bg-teal-100 dark:bg-teal-700' },
	{ name: 'fuchsia', cssClass: 'bg-fuchsia-100 dark:bg-fuchsia-700' }
];

export type Colour = (typeof colours)[number]['name'];

interface GetNoteCssClass {
	colour?: Colour;
}

export function getNoteCssClass({ colour }: GetNoteCssClass) {
	const colourValue = colours.find((c) => c.name === colour);
	return `dark:text-darkText border ${colourValue?.cssClass ?? 'bg-white dark:bg-dark'}`;
}
