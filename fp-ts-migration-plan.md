# fp-ts Migration Plan

## Background

`fp-ts` (`^2.16.5`) is used throughout the server-side codebase for typed, composable error
handling. The library is being deprecated as the author pivots to the
[Effect](https://effect.website) ecosystem. This document analyses the current usage, compares
replacement options, and proposes a migration strategy.

---

## Current Usage

**36 files** use `fp-ts`. All usage is server-side (API routes, services, DB layer, auth). No
client-side / Svelte components are affected.

### Modules in use

| fp-ts module | Usage |
|---|---|
| `taskEither as TE` | Dominant pattern — async operations that can fail |
| `either as E` | Synchronous operations that can fail |
| `pipe` | Composing operations left-to-right |

### Patterns in use

```ts
// 1. Wrapping a throwing async call
TE.tryCatch(asyncFn, withError('DatabaseError', 'message'))

// 2. Chaining async steps
pipe(
  stepA(),
  TE.flatMap(a => stepB(a)),
  TE.map(b => transform(b)),
  TE.mapLeft(mapToApiError),
)

// 3. Collecting named results (Do-notation)
pipe(
  TE.Do,
  TE.bind('user', () => getUser(id)),
  TE.bind('board', () => getBoard(userId)),
  TE.flatMap(({ user, board }) => doWork(user, board))
)

// 4. Terminal match
TE.match(
  (err) => error(err.status, { message: err.message }),
  (data) => json(data)
)()

// 5. Sync validation lifted to async
pipe(
  validateParams(params),   // E.Either
  TE.fromEither,
  TE.flatMap(...)
)
```

### File groups

| Group | Files |
|---|---|
| DB layer | `src/lib/server/db/*.ts` (4 files) |
| Services | `src/lib/server/services/*.ts` (4 files) |
| Auth | `src/lib/auth/*.ts` (5 files) |
| API routes | `src/routes/api/**/*.ts` (15 files) |
| Page servers | `src/routes/my/**/*.ts` (3 files) |
| Infrastructure | `src/hooks.server.ts`, `src/lib/server/requestParser.ts`, `src/lib/server/serverFetch.ts` |
| Tests | `src/**/*.test.ts` (4 files) |

---

## Options

### Option A — Custom `Result` type (plain TypeScript)

Define a lightweight `Result<T, E>` / `AsyncResult<T, E>` type internally, replace all fp-ts
patterns with `async/await`.

```ts
// utils/result.ts
export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export type AsyncResult<T, E = Error> = Promise<Result<T, E>>;

export const ok  = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });

export const tryCatch = async <T, E>(
  fn: () => Promise<T>,
  onError: (e: unknown) => E
): AsyncResult<T, E> => {
  try {
    return ok(await fn());
  } catch (e) {
    return err(onError(e));
  }
};
```

**Before (fp-ts):**
```ts
export const getNoteById = ({ id }: IdParams): TE.TaskEither<ServerError, Note> =>
  pipe(
    tryDbTask(() => db.note.findFirst({ where: { id } })),
    TE.flatMap(fromNullableRecord(`Note with id ${id} not found`))
  );
```

**After (custom Result):**
```ts
export const getNoteById = async ({ id }: IdParams): AsyncResult<Note, ServerError> => {
  const result = await tryDbTask(() => db.note.findFirst({ where: { id } }));
  if (!result.ok) return result;
  if (!result.value) return err(createError('RecordNotFound', `Note with id ${id} not found`));
  return ok(result.value);
};
```

**Pros:** Zero dependencies, readable, idiomatic TypeScript, easy to onboard new developers.
**Cons:** Verbose for multi-step chains; `Do`-notation equivalent requires sequential `if (!r.ok) return r` guards.

---

### Option B — [neverthrow](https://github.com/supermacro/neverthrow)

A purpose-built, lightweight Result-type library (~1 kB). It provides `Result` and `ResultAsync`
with method chaining (`.map`, `.mapErr`, `.andThen`, `.match`).

```ts
import { ResultAsync, errAsync, okAsync } from 'neverthrow';

export const getNoteById = ({ id }: IdParams): ResultAsync<Note, ServerError> =>
  tryDbTask(() => db.note.findFirst({ where: { id } }))
    .andThen(note =>
      note ? okAsync(note) : errAsync(createError('RecordNotFound', `Note with id ${id} not found`))
    );
```

**Pros:** Very close to current fp-ts style (method chaining vs `pipe`); minimal learning curve;
actively maintained; no `pipe` required.
**Cons:** Adds a new dependency; slightly different API than fp-ts (methods vs functions); no
`Do`-notation equivalent (use `combine` or sequential `andThen`).

---

### Option C — [Effect](https://effect.website)

The spiritual successor to fp-ts by the same author. `Effect<A, E, R>` replaces
`TaskEither<E, A>`. Offers the same composable pattern plus structured concurrency, dependency
injection, tracing, and more.

```ts
import { Effect } from 'effect';

export const getNoteById = ({ id }: IdParams): Effect.Effect<Note, ServerError> =>
  Effect.tryPromise({
    try: () => db.note.findFirst({ where: { id } }),
    catch: withError('DatabaseError', 'Unexpected database error')
  }).pipe(
    Effect.flatMap(note =>
      note ? Effect.succeed(note) : Effect.fail(createError('RecordNotFound', `Note with id ${id} not found`))
    )
  );
```

**Pros:** Direct conceptual migration from fp-ts; same `pipe`-based composition; future-proof;
powerful ecosystem (Schema, Stream, Layer).
**Cons:** Significant learning curve; large bundle; major overkill for a SvelteKit app of this
size; introduces runtime overhead.

---

## Recommendation

**Option A (custom Result type)** is recommended for this codebase.

Reasons:
- The usage is narrow and consistent: only `TaskEither` + `pipe` + a handful of combinators.
- The code is entirely server-side — bundle size is not a concern, but readability and
  maintainability are.
- `async/await` is the idiomatic TypeScript pattern for async error handling; new contributors
  will understand it immediately.
- Eliminates an external dependency entirely.
- The repetitive `Do + bind` pattern maps cleanly to sequential `const result = await ...; if (!result.ok) return result;` guards.

**Option B (neverthrow)** is a good fallback if the team prefers keeping method-chaining style
with minimal refactor effort.

**Option C (Effect)** should only be considered if the project needs structured concurrency,
observability, or DI — none of which are currently required.

---

## Migration Strategy

### Phase 0 — Preparation (no behavioural changes)

1. Create `src/lib/server/result.ts` — the shared `Result` / `AsyncResult` utilities.
2. Create `src/lib/server/dbUtils.ts` — new `tryDbTask` and `fromNullable` helpers that return
   `AsyncResult` instead of `TaskEither`.
3. Keep fp-ts installed; run existing tests green.

### Phase 1 — DB layer (lowest risk, no business logic)

Migrate the 4 files in `src/lib/server/db/`:
- `utils.ts` → replace `tryDbTask` and `fromNullableRecord`
- `notesDb.ts`
- `userDb.ts`
- `boardDb.ts`

Each function signature changes from `TE.TaskEither<ServerError, T>` to `AsyncResult<T, ServerError>`.

### Phase 2 — Auth layer

Migrate `src/lib/auth/`:
- `session.ts` — `getSession` returns `AsyncResult<User, false | ServerError>`
- `verifyToken.ts`, `fetchUser.ts`, `updateAuthUser.ts`, `getToken.ts`

### Phase 3 — Services

Migrate `src/lib/server/services/`:
- `emailService.ts`
- `userService.ts`
- `friendService.ts` (uses both `TE` and `E`; sync validation becomes a plain `if` guard)
- `noteService.ts`

### Phase 4 — Infrastructure & hooks

- `src/lib/server/requestParser.ts`
- `src/lib/server/serverFetch.ts`
- `src/hooks.server.ts`

### Phase 5 — API routes & page servers

Migrate all 18 route files. These are the most verbose as they chain multiple steps with
`TE.Do + TE.bind`. Each chain becomes a sequential `async` function with early returns.

**Before:**
```ts
export const POST: RequestHandler = async ({ locals, request }) =>
  pipe(
    TE.Do,
    TE.bind('input', () => parseRequest(request, Schema, 'msg')),
    TE.bind('board', () => getBoardByUserId({ userId: locals.user!.id })),
    TE.flatMap(({ board, input }) => createNote({ ...input, boardId: board.id })),
    TE.mapLeft(mapToApiError),
    TE.match(
      (err) => error(err.status, { message: err.message }),
      (note) => json(note, { status: 201 })
    )
  )();
```

**After:**
```ts
export const POST: RequestHandler = async ({ locals, request }) => {
  const inputResult = await parseRequest(request, Schema, 'msg');
  if (!inputResult.ok) return mapToHttpError(inputResult.error);

  const boardResult = await getBoardByUserId({ userId: locals.user!.id });
  if (!boardResult.ok) return mapToHttpError(boardResult.error);

  const noteResult = await createNote({ ...inputResult.value, boardId: boardResult.value.id });
  if (!noteResult.ok) return mapToHttpError(noteResult.error);

  return json(noteResult.value, { status: 201 });
};
```

### Phase 6 — Tests & cleanup

- Update test helpers in `src/test-utils/assertions.ts` and all `*.test.ts` files.
- Remove `fp-ts` from `package.json`.
- Run `npm run check` and `npm test`.

---

## New Core Utilities

### `src/lib/server/result.ts`

```ts
export type Result<T, E = ServerError> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export type AsyncResult<T, E = ServerError> = Promise<Result<T, E>>;

export const ok  = <T>(value: T): Result<T, never>  => ({ ok: true,  value });
export const err = <E>(error: E): Result<never, E>   => ({ ok: false, error });

export const tryCatch = async <T, E>(
  fn: () => Promise<T>,
  onError: (e: unknown) => E
): AsyncResult<T, E> => {
  try   { return ok(await fn()); }
  catch (e) { return err(onError(e)); }
};

/** Lift a nullable value to a Result. */
export const fromNullable = <T, E>(value: T | null | undefined, error: E): Result<T, E> =>
  value != null ? ok(value) : err(error);
```

### `src/lib/server/apiResultMapper.ts` update

The existing `mapToApiError` function is adapted to work directly on `ServerError` (no change to
its internal logic).

---

## Effort Estimate

| Phase | Files | Complexity |
|---|---|---|
| 0 — Setup | 2 new files | Low |
| 1 — DB layer | 4 | Low |
| 2 — Auth | 5 | Low–Medium |
| 3 — Services | 4 | Medium |
| 4 — Infrastructure | 3 | Low |
| 5 — Routes | 18 | Medium |
| 6 — Tests & cleanup | 4 + `package.json` | Low |

Total: ~40 files touched. The patterns are repetitive, making each file straightforward once the
approach is established. Phases can be done incrementally in separate PRs; fp-ts can coexist with
the new Result type until all files are migrated.
