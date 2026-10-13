/** An error with an HTTP status code, thrown from routes and turned into a JSON response by the error handler. */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly errors?: Record<string, string>,
  ) {
    super(message);
    this.name = "HttpError";
  }
}
