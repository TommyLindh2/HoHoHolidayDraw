import { Router } from "express";
import { DbStorage } from "../storage";
import { parseId, parsePersonInput, parsePersonUpdate } from "../validation";

export function personRouter(storage: DbStorage): Router {
    const router = Router();

    router.get("/", (_req, res) => {
        res.json({ persons: storage.GetPersons() });
    });

    router.post("/", (req, res) => {
        res.status(201).json(storage.CreatePerson(parsePersonInput(req.body)));
    });

    router.get("/:id", (req, res) => {
        res.json(storage.GetPersonById(parseId(req.params.id)));
    });

    router.put("/:id", (req, res) => {
        const update = parsePersonUpdate(req.body);
        res.json(storage.UpdatePerson(parseId(req.params.id), update));
    });

    router.delete("/:id", (req, res) => {
        storage.DeletePerson(parseId(req.params.id));
        res.status(204).end();
    });

    return router;
}
