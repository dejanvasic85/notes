import { nanoid } from 'nanoid';

export function generateId(prefix: 'nid' | 'bid' | 'uid' | 'inv' | 'ned') {
	return `${prefix}_${nanoid(8)}`;
}
