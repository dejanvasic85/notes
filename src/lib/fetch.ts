export enum MaybeType {
	Ok = 'ok',
	Error = 'error'
}

interface Some<T> {
	type: MaybeType.Ok;
	value: T;
}

interface None {
	type: MaybeType.Error;
	value: Error;
}

export type Maybe<T> = Some<T> | None;

export function some<T>(value: T): Some<T> {
	return {
		type: MaybeType.Ok,
		value
	};
}

export function none(message: string): None {
	return {
		type: MaybeType.Error,
		value: new Error(message)
	};
}

interface FetchOptions {
	getBearerToken?: () => Promise<string>;
	shouldParse?: boolean;
}

export async function tryFetch<T>(
	input: URL | RequestInfo,
	init?: RequestInit,
	options?: FetchOptions
): Promise<Maybe<T>> {
	try {
		const token = options?.getBearerToken ? await options.getBearerToken() : null;

		const response = await fetch(input, {
			...init,
			headers: {
				...init?.headers,
				'Content-Type': 'application/json',
				...(token ? { Authorization: `Bearer ${token}` } : {})
			}
		});

		if (response.ok) {
			const shouldParse = options?.shouldParse ?? true;
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
		if (error instanceof Error) {
			return none(error.message);
		}
		return none(`Unknown error: ${JSON.stringify(error)}`);
	}
}
