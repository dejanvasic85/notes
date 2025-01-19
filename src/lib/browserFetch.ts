interface Some<T> {
	type: 'ok';
	value: T;
}

interface None {
	type: 'error';
	value: Error;
}

export type Maybe<T> = Some<T> | None;

export function some<T>(value: T): Some<T> {
	return {
		type: 'ok',
		value
	};
}

export function none(message: string): None {
	return {
		type: 'error',
		value: new Error(message)
	};
}

interface FetchOptions {
	shouldParse?: boolean;
}

export async function tryFetch<T>(
	input: URL | RequestInfo,
	init?: RequestInit,
	options?: FetchOptions
): Promise<Maybe<T>> {
	try {
		const response = await fetch(input, {
			...init,
			headers: {
				...init?.headers,
				'Content-Type': 'application/json'
			}
		});

		if (response.ok) {
			const shouldParse = options?.shouldParse ?? false;
			if (shouldParse) {
				const data = await response.json();
				return some(data) as Maybe<T>;
			} else {
				return some(null) as Maybe<T>;
			}
		}
		const rawText = await response.text();
		return none(rawText);
	} catch (error: unknown) {
		console.error('Failed to fetch', error);
		if (error instanceof Error) {
			return none(error.message);
		}
		return none(`Unknown error: ${JSON.stringify(error)}`);
	}
}
