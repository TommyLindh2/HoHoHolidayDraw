export class ResponseError extends Error {
    constructor(
        public readonly response: Response,
        message?: string,
        /** Machine-readable error code from the backend, if any. */
        public readonly code?: string
    ) {
        super(message || `${response.status} - ${response.statusText}`);
    }

    /** Uses the backend's `{ error }` message when there is one. */
    public static async From(response: Response): Promise<ResponseError> {
        try {
            const body: unknown = await response.json();
            if (typeof body === 'object' && body !== null) {
                const { error, code } = body as { error?: unknown; code?: unknown };
                return new ResponseError(
                    response,
                    typeof error === 'string' ? error : undefined,
                    typeof code === 'string' ? code : undefined
                );
            }
        } catch {
            // Not JSON, fall back to the status text.
        }
        return new ResponseError(response);
    }
}
