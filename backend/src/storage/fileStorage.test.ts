import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { FileStorage } from "./fileStorage";

test("changes survive reopening, and a deleted person leaves groups and their exclusions", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "hhd-"));
    const file = path.join(dir, "db.json");
    try {
        const storage = FileStorage.Open(file);
        const anna = storage.CreatePerson({ name: "Anna" });
        const bo = storage.CreatePerson({ name: "Bo", pictureUrl: "/bo.jpg" });
        const cia = storage.CreatePerson({ name: "Cia" });
        const group = storage.CreateGroup({
            name: "Family",
            personIds: [anna.id, bo.id, cia.id],
            exclusions: [
                { giverId: bo.id, receiverId: anna.id },
                { giverId: bo.id, receiverId: cia.id },
            ],
        });
        storage.UpdatePerson(bo.id, { pictureUrl: null });
        storage.DeletePerson(anna.id);

        const reopened = FileStorage.Open(file);
        assert.deepEqual(reopened.GetPersons(), [
            { id: bo.id, name: "Bo" },
            { id: cia.id, name: "Cia" },
        ]);
        assert.deepEqual(reopened.GetGroupById(group.id), {
            id: group.id,
            name: "Family",
            personIds: [bo.id, cia.id],
            exclusions: [{ giverId: bo.id, receiverId: cia.id }],
        });
        // Ids keep counting up after a restart instead of being reused.
        assert.ok(reopened.CreatePerson({ name: "Dan" }).id > group.id);
    } finally {
        fs.rmSync(dir, { recursive: true, force: true });
    }
});
