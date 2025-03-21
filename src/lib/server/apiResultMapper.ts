import type { ApiError, ServerError } from '$lib/types';

export const mapToApiError = <T extends ServerError>(err: T): ApiError => {
	console.error(err);
	switch (err._tag) {
		case 'DatabaseError':
		case 'SendEmailError':
		case 'FetchError': {
			return { status: 500, message: err.message };
		}
		case 'RecordNotFound': {
			return { status: 404, message: err.message };
		}
		case 'AuthorizationError': {
			return { status: 401, message: err.message };
		}
		case 'ValidationError': {
			return { status: 400, message: err.message };
		}
	}
};
