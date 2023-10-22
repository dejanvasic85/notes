import { nanoid } from 'nanoid';

export function generateId(prefix: 'nid' | 'bid' | 'uid') {
	return `${prefix}_${nanoid(8)}`;
}
