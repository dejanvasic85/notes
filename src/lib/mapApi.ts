import type { ApiError, ServerError } from '$lib/types';

export const mapToApiError = <T extends ServerError>(err: T): ApiError => {
	switch (err._tag) {
		case 'DatabaseError':
		case 'FetchError': {
			return { status: 500, message: err.message };
		}
		case 'RecordNotFound': {
			return { status: 404, message: err.message };
		}
	}
};
