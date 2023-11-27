import { taskEither as TE } from 'fp-ts';
import { pipe } from 'fp-ts/lib/function';

import db from '$lib/server/db';
import type { ServerError, Note, IdParams } from '$lib/types';
import { fromNullableRecord, tryDbTask } from './utils';

export const getNoteById = ({ id }: IdParams): TE.TaskEither<ServerError, Note> =>
	pipe(
		tryDbTask(() => db.note.findUnique({ where: { id } })),
		TE.chain(fromNullableRecord(`Note with id ${id} not found`))
	);
