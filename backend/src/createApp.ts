import cors from "cors";
import express, { Express, NextFunction, Request, Response } from "express";
import * as errors from "./errors";
import { groupRouter } from "./routes/group";
import { personRouter } from "./routes/person";
import { DbStorage } from "./storage";

function isJsonParseError(err: unknown): boolean {
    return (
        err instanceof SyntaxError &&
        (err as SyntaxError & { type?: string }).type === "entity.parse.failed"
    );
}

export function createApp(storage: DbStorage): Express {
    const app = express();

    app.use(cors());
    app.use(express.json());

    app.use("/api/person", personRouter(storage));
    app.use("/api/group", groupRouter(storage));

    app.use(
        (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
            if (err instanceof errors.NotFoundError) {
                res.status(404).json({ error: err.message });
                return;
            }
            if (err instanceof errors.ValidationError) {
                res.status(400).json({
                    error: err.message,
                    ...(err.code ? { code: err.code } : {}),
                });
                return;
            }
            if (isJsonParseError(err)) {
                res.status(400).json({ error: "Malformed JSON body" });
                return;
            }

            console.error(err);
            res.status(500).json({ error: "An error occurred" });
        }
    );

    return app;
}
