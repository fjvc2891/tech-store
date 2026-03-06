/**
 * Railway Oriented Programming - Result type
 * Represents either a success (Ok) or failure (Err)
 */
export type Result<T, E = Error> = Ok<T, E> | Err<T, E>;

export class Ok<T, E> {
    readonly isOk = true;
    readonly isErr = false;
    constructor(public readonly value: T) { }
}

export class Err<T, E> {
    readonly isOk = false;
    readonly isErr = true;
    constructor(public readonly error: E) { }
}

export const ok = <T, E = Error>(value: T): Result<T, E> => new Ok(value);
export const err = <T, E = Error>(error: E): Result<T, E> => new Err(error);
