interface CustomMatchers<R = unknown> {
	toBeRightStrictEqual(data: unknown): R;
	toBeLeftStrictEqual(data: unknown): R;
	toBeLeft(tag: string): R;
}

declare module 'vitest' {
	interface Assertion<T = any> extends CustomMatchers<T> {}
	interface AsymmetricMatchersContaining extends CustomMatchers {}
}

export {};
