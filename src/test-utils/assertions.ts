import type { Result } from 'neverthrow';

export const isOkEqual = (received: Result<unknown, unknown>, expected: unknown) =>
	received.isOk() && deepEqual(received.value, expected);

export const isErrEqual = (received: Result<unknown, unknown>, expected: unknown) =>
	received.isErr() && deepEqual(received.error, expected);

export const isOk = (received: Result<unknown, unknown>) => received.isOk();

export const isErrTag = (received: Result<unknown, unknown>, expectedTag: string) =>
	received.isErr() && (received.error as any)._tag === expectedTag;

function deepEqual(object1: unknown, object2: unknown): boolean {
	if (object1 === object2) return true;
	if (typeof object1 !== 'object' || typeof object2 !== 'object') return false;
	if (object1 == null || object2 == null) return false;

	const keys1 = Object.keys(object1);
	const keys2 = Object.keys(object2);

	if (keys1.length !== keys2.length) {
		return false;
	}

	for (const key of keys1) {
		const val1 = (object1 as any)[key];
		const val2 = (object2 as any)[key];
		const areObjects = isObject(val1) && isObject(val2);

		if (areObjects && !deepEqual(val1, val2)) {
			return false;
		} else if (!areObjects && val1 !== val2) {
			return false;
		}
	}

	return true;
}

function isObject(object: unknown): boolean {
	return object != null && typeof object === 'object';
}
