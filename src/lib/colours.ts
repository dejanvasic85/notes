/*
 * The `name` of each colour is persisted in the database (Note.colour) and is
 * used as the accessible label on the colour-picker swatches, so these names
 * must not change — only their values do.
 */
export const colours = [
	{ name: 'indigo', cssClass: 'bg-note-indigo dark:bg-note-indigo-dark' },
	{ name: 'blue', cssClass: 'bg-note-blue dark:bg-note-blue-dark' },
	{ name: 'rose', cssClass: 'bg-note-rose dark:bg-note-rose-dark' },
	{ name: 'amber', cssClass: 'bg-note-amber dark:bg-note-amber-dark' },
	{ name: 'teal', cssClass: 'bg-note-teal dark:bg-note-teal-dark' },
	{ name: 'fuchsia', cssClass: 'bg-note-fuchsia dark:bg-note-fuchsia-dark' }
];

export type Colour = (typeof colours)[number]['name'];

interface GetNoteCssClass {
	colour?: Colour;
}

export function getNoteCssClass({ colour }: GetNoteCssClass) {
	const colourValue = colours.find((c) => c.name === colour);
	return `text-ink ${colourValue?.cssClass ?? 'bg-paper'}`;
}
