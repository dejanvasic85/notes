import { nanoid } from 'nanoid';

export function generateId(prefix: string) {
	return `${prefix}_${nanoid(8)}`;
}
