import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import db from '$lib/db';
import type { User } from '$lib/types';
import type { DatabaseResult } from './types';
import { fromNullableRecord, toDatabasError } from './utils';

interface GetUserByIdTaskParams {
	id: string;
	includeBoards?: boolean;
	includeNotes?: boolean;
}

export const getUserByIdTask = ({
	id,
	includeBoards = true,
	includeNotes = true
}: GetUserByIdTaskParams): TE.TaskEither<DatabaseResult, User> =>
	pipe(
		TE.tryCatch(
			() =>
				db.user.findUnique({
					where: { id },
					include: {
						boards: {
							include: {
								notes: includeNotes
							}
						}
					}
				}),
			toDatabasError
		),
		TE.chain(fromNullableRecord(`User with id ${id} not found`)),
		TE.map((user) => ({
			...user,
			boards: !includeBoards
				? []
				: user.boards.map((board) => ({ ...board, notes: includeNotes ? board.notes : [] }))
		}))
	);
