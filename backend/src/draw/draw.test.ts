import assert from "node:assert/strict";
import { test } from "node:test";
import { ValidationError } from "../errors";
import { drawAssignments } from "./draw";

test("same seed and members always give the same draw", () => {
    const first = drawAssignments([4, 1, 9, 7, 3], "christmas");
    const reordered = drawAssignments([9, 3, 7, 1, 4], "christmas");
    assert.deepEqual(reordered, first);
    assert.notDeepEqual(drawAssignments([4, 1, 9, 7, 3], "easter"), first);
});

test("everybody gives and receives exactly once, never to themselves", () => {
    const ids = [1, 2, 3, 4, 5, 6, 7, 8];
    for (let seed = 0; seed < 500; seed++) {
        const result = drawAssignments(ids, `seed-${seed}`);
        assert.deepEqual(result.map((a) => a.giverId).sort(), ids);
        assert.deepEqual(result.map((a) => a.receiverId).sort(), ids);
        assert.ok(result.every((a) => a.giverId !== a.receiverId));
    }
});

test("refuses to draw with fewer than two persons", () => {
    assert.throws(() => drawAssignments([1, 1], "x"), ValidationError);
});
