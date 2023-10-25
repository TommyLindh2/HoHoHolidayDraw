export class ResponseError extends Error {
    constructor(public response: Response) {
        super(`${response.status} - ${response.statusText}`);
    }
}
