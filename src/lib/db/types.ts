export interface DatabaseError {
	readonly _tag: 'DatabaseError';
	readonly message: string;
	readonly originalError: Error | string;
}

export interface RecordNotFoundError {
	readonly _tag: 'RecordNotFound';
	readonly message: string;
}

export type DatabaseResult = DatabaseError | RecordNotFoundError;
