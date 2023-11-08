import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import db from '$lib/db';
import type { User } from '$lib/types';
import type { DatabaseResult } from './types';
import { fromNullableRecord, toDatabasError } from './utils';

export const getUserByIdTask = ({ id }: { id: string }): TE.TaskEither<DatabaseResult, User> =>
	pipe(
		TE.tryCatch(() => db.user.findUnique({ where: { id } }), toDatabasError),
		TE.chain(fromNullableRecord(`User with id ${id} not found`)),
		TE.map((user) => ({
			...user,
			boards: []
		}))
	);
