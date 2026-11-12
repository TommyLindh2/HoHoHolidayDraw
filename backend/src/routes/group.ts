import { Router } from "express";
import { drawAssignments, generateSeed } from "../draw";
import { DrawResult } from "../models";
import { DbStorage } from "../storage";
import {
    parseGroupInput,
    parseGroupUpdate,
    parseId,
    parseSeed,
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

    /**
     * GET /api/group/:id/draw?seed=abc
     * Same seed + same members = same result. Omit the seed to get a new one.
     */
    router.get("/:id/draw", (req, res) => {
        const group = storage.GetGroupById(parseId(req.params.id));
        const seed = parseSeed(req.query.seed) ?? generateSeed();
        const result: DrawResult = {
            seed,
            assignments: drawAssignments(group.personIds, seed),
        };
        res.json(result);
    });

    return router;
}
