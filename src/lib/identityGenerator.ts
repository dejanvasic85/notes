import { nanoid } from 'nanoid';

export function generateId(prefix: 'nid' | 'bid' | 'uid' | 'inv' | 'ned' | 'qm') {
	return `${prefix}_${nanoid(8)}`;
}
