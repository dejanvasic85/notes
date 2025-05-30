export const colours = [
	{ name: 'indigo', cssClass: 'bg-indigo-100 dark:bg-indigo-900' },
	{ name: 'blue', cssClass: 'bg-blue-100 dark:bg-blue-900' },
	{ name: 'rose', cssClass: 'bg-rose-100 dark:bg-red-900' },
	{ name: 'amber', cssClass: 'bg-amber-100 dark:bg-amber-900' },
	{ name: 'teal', cssClass: 'bg-teal-100 dark:bg-teal-900' },
	{ name: 'fuchsia', cssClass: 'bg-fuchsia-100 dark:bg-fuchsia-900' }
];

export type Colour = (typeof colours)[number]['name'];

interface GetNoteCssClass {
	colour?: Colour;
}

export function getNoteCssClass({ colour }: GetNoteCssClass) {
	const colourValue = colours.find((c) => c.name === colour);
	return `dark:text-dark-text border ${colourValue?.cssClass ?? 'bg-white dark:bg-dark'}`;
}
