import { nanoid } from 'nanoid';

export function generateId(prefix: 'nid' | 'bid' | 'uid' | 'inv') {
	return `${prefix}_${nanoid(8)}`;
}
