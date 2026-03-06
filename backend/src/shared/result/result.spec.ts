import { ok, err, Ok, Err } from './result';

describe('Result Type (ROP)', () => {
    it('should create an Ok result', () => {
        const result = ok('success');
        expect(result.isOk).toBe(true);
        expect(result.isErr).toBe(false);
        if (result.isOk) {
            expect(result.value).toBe('success');
        }
    });

    it('should create an Err result', () => {
        const error = new Error('fail');
        const result = err(error);
        expect(result.isOk).toBe(false);
        expect(result.isErr).toBe(true);
        if (result.isErr) {
            expect(result.error).toBe(error);
        }
    });

    it('should instance classes correctly', () => {
        const success = new Ok('val');
        const failure = new Err('err');
        expect(success instanceof Ok).toBe(true);
        expect(failure instanceof Err).toBe(true);
    });
});
