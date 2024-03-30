import { either as E } from 'fp-ts';
import * as vitest from 'vitest';

vitest.expect.extend({
	toBeRightStrictEqual(received: E.Either<unknown, unknown>, expected: unknown) {
		return {
			pass: E.isRight(received) && this.equals(received.right, expected),
			message: () =>
				`expected ${JSON.stringify(received)} to be Either Right ${JSON.stringify(expected)}`
		};
	},
	toBeLeftStrictEqual(received, expected) {
		return {
			pass: E.isLeft(received) && this.equals(received.left, expected),
			message: () =>
				`expected ${JSON.stringify(received)} to be Either Left ${JSON.stringify(expected)}`
		};
	},
	toBeLeft(received, expected) {
		return {
			pass: E.isLeft(received) && (received.left as any)._tag === expected,
			message: () => `expected ${JSON.stringify(received)} to be Either Left ${expected}`
		};
	},
	toBeRight(received) {
		return {
			pass: E.isRight(received),
			message: () => `expected ${JSON.stringify(received)} to be Either Right`
		};
	}
});
