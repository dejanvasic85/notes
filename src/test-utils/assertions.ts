import { either as E } from 'fp-ts';

export const isRightEqual = (received: E.Either<unknown, unknown>, expected: unknown) => {
	return E.isRight(received) && deepEqual(received.right, expected);
};

export const isLeftEqual = (received: E.Either<unknown, unknown>, expected: any) => {
	return E.isLeft(received) && deepEqual(received.left, expected);
};

export const isRight = (received: E.Either<unknown, unknown>) => {
	return E.isRight(received);
};

export const isLeft = (received: E.Either<unknown, unknown>, expected: string) => {
	return E.isLeft(received) && (received.left as any)._tag === expected;
};

function deepEqual(object1: any, object2: any): boolean {
	// Get the keys of both objects
	const keys1 = Object.keys(object1);
	const keys2 = Object.keys(object2);

	// If number of properties is different, objects are not equal
	if (keys1.length !== keys2.length) {
		return false;
	}

	// Iterate through keys to compare values deeply
	for (const key of keys1) {
		const val1 = object1[key];
		const val2 = object2[key];
		const areObjects = isObject(val1) && isObject(val2);

		// If values are both objects, recursively call deepEqual
		if (areObjects && !deepEqual(val1, val2)) {
			return false;
		}
		// If values are not both objects and not equal, objects are not equal
		else if (!areObjects && val1 !== val2) {
			return false;
		}
	}

	return true;
}

function isObject(object: any): boolean {
	return object != null && typeof object === 'object';
}
