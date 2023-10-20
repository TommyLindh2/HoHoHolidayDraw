import express, { Request, Response } from "express";
import { DbStorage, MemoryStorage, InitializeDefaultPersons } from "./storage";
import * as errors from "./errors";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

app.use(express.json());

const storage: DbStorage = new MemoryStorage();
InitializeDefaultPersons(storage);

app.get("/api/person", (req: Request, res: Response) => {
    return res.json({
        persons: storage.GetPersons(),
    });
});

app.get("/api/person/:id", (req: Request, res: Response) => {
    const requestedId = req.params.id;
    if (isNaN(requestedId as any)) {
        return res
            .status(400)
            .json({ error: "Invalid ID. ID must be a number." });
    }
    const personId = parseInt(req.params.id);

    const person = storage.GetPersonById(personId);
    if (!person) {
        return res.status(404).json({
            error: `Person with ID: ${personId} not found`,
        });
    }

    return res.json(person);
});

app.get("/api/group", (req: Request, res: Response) => {
    return res.json({
        groups: storage.GetGroups(),
    });
});

app.get("/api/group/:id", (req: Request, res: Response) => {
    const requestedId = req.params.id;
    if (isNaN(requestedId as any)) {
        return res
            .status(400)
            .json({ error: "Invalid ID. ID must be a number." });
    }
    const groupId = parseInt(req.params.id);

    const group = storage.GetGroupById(groupId);
    if (!group) {
        return res.status(404).json({
            error: `Group with ID: ${groupId} not found`,
        });
    }

    return res.json(group);
});

app.get("/api/group/:id/person", (req: Request, res: Response) => {
    const requestedId = req.params.id;
    if (isNaN(requestedId as any)) {
        return res
            .status(400)
            .json({ error: "Invalid ID. ID must be a number." });
    }
    const groupId = parseInt(req.params.id);

    const group = storage.GetGroupById(groupId);
    if (!group) {
        return res.status(404).json({
            error: `Group with ID: ${groupId} not found`,
        });
    }

    const persons = storage.GetPersonsByGroup(groupId);

    return res.json({
        persons: persons,
    });
});

/**
 * Error handling
 */
app.use((err: Error, req: Request, res: Response, next: any) => {
    console.log(err.stack);
    if (err instanceof errors.NotFoundError) {
        res.status(404).json({ error: err.message });
    }

    res.status(500).json({ error: "An error occurred" });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
