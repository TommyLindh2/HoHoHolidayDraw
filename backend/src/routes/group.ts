import { Router } from "express";
import { DbStorage } from "../storage";
import {
    parseGroupInput,
    parseGroupUpdate,
    parseId,
} from "../validation";

export function groupRouter(storage: DbStorage): Router {
    const router = Router();

    router.get("/", (_req, res) => {
        res.json({ groups: storage.GetGroups() });
    });

    router.post("/", (req, res) => {
        res.status(201).json(storage.CreateGroup(parseGroupInput(req.body)));
    });

    router.get("/:id", (req, res) => {
        res.json(storage.GetGroupById(parseId(req.params.id)));
    });

    router.put("/:id", (req, res) => {
        const update = parseGroupUpdate(req.body);
        res.json(storage.UpdateGroup(parseId(req.params.id), update));
    });

    router.delete("/:id", (req, res) => {
        storage.DeleteGroup(parseId(req.params.id));
        res.status(204).end();
    });

    router.get("/:id/person", (req, res) => {
        res.json({
            persons: storage.GetPersonsByGroup(parseId(req.params.id)),
        });
    });

    router.put("/:id/person/:personId", (req, res) => {
        res.json(
            storage.AddPersonToGroup(
                parseId(req.params.id),
                parseId(req.params.personId, "person ID")
            )
        );
    });

    router.delete("/:id/person/:personId", (req, res) => {
        res.json(
            storage.RemovePersonFromGroup(
                parseId(req.params.id),
                parseId(req.params.personId, "person ID")
            )
        );
    });

    return router;
}
