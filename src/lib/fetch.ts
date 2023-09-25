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

export async function tryFetch<T>(input: URL | RequestInfo, init?: RequestInit): Promise<Maybe<T>> {
	try {
		const response = await fetch(input, init);
		if (response.ok) {
			const data = await response.json();
			return some(data);
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
