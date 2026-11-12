import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { FileStorage } from "./fileStorage";

test("changes survive reopening, and deleting a person leaves its groups", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "hhd-"));
    const file = path.join(dir, "db.json");
    try {
        const storage = FileStorage.Open(file);
        const anna = storage.CreatePerson({ name: "Anna" });
        const bo = storage.CreatePerson({ name: "Bo", pictureUrl: "/bo.jpg" });
        const group = storage.CreateGroup({
            name: "Family",
            personIds: [anna.id, bo.id],
        });
        storage.UpdatePerson(bo.id, { pictureUrl: null });
        storage.DeletePerson(anna.id);

        const reopened = FileStorage.Open(file);
        assert.deepEqual(reopened.GetPersons(), [{ id: bo.id, name: "Bo" }]);
        assert.deepEqual(reopened.GetGroupById(group.id).personIds, [bo.id]);
        // Ids keep counting up after a restart instead of being reused.
        assert.ok(reopened.CreatePerson({ name: "Cia" }).id > group.id);
    } finally {
        fs.rmSync(dir, { recursive: true, force: true });
    }
});
