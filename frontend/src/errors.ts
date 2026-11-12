export class ResponseError extends Error {
    constructor(public readonly response: Response, message?: string) {
        super(message || `${response.status} - ${response.statusText}`);
    }

    /** Uses the backend's `{ error }` message when there is one. */
    public static async From(response: Response): Promise<ResponseError> {
        try {
            const body: unknown = await response.json();
            if (
                typeof body === 'object' &&
                body !== null &&
                typeof (body as { error?: unknown }).error === 'string'
            ) {
                return new ResponseError(response, (body as { error: string }).error);
            }
        } catch {
            // Not JSON, fall back to the status text.
        }
        return new ResponseError(response);
    }
}
