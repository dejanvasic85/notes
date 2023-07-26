export const colours = [
	{ name: 'slate', cssClass: 'bg-slate-800' },
	{ name: 'indigo', cssClass: 'bg-indigo-800' },
	{ name: 'blue', cssClass: 'bg-blue-800' },
	{ name: 'rose', cssClass: 'bg-rose-800' },
	{ name: 'orange', cssClass: 'bg-orange-800' },
	{ name: 'amber', cssClass: 'bg-amber-800' },
	{ name: 'teal', cssClass: 'bg-teal-800' }
];

export type Colour = (typeof colours)[number]['name'];
