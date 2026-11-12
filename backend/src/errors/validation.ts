export class ValidationError extends Error {
    /** Optional machine-readable code so clients can show their own message. */
    constructor(message: string, public readonly code?: string) {
        super(message);
    }
}
