import assert from "node:assert/strict";
import { test } from "node:test";
import { ValidationError } from "../errors";
import { DRAW_IMPOSSIBLE, drawAssignments } from "./draw";

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

test("respects exclusions, also when only a search can find a draw", () => {
    const ids = [1, 2, 3, 4, 5, 6];
    // 1 never gives to 2 or 3; 4 never gives to 1.
    const loose = new Map([[1, [2, 3]], [4, [1]]]);
    // Only one valid draw left: 1->2->3->4->5->6->1.
    const tight = new Map(
        ids.map((id) => [id, ids.filter((other) => other !== (id % 6) + 1)])
    );

    for (let seed = 0; seed < 200; seed++) {
        for (const exclusions of [loose, tight]) {
            const result = drawAssignments(ids, `seed-${seed}`, exclusions);
            assert.deepEqual(result.map((a) => a.receiverId).sort(), ids);
            for (const { giverId, receiverId } of result) {
                assert.ok(!exclusions.get(giverId)?.includes(receiverId));
            }
        }
    }
});

test("reports when exclusions make a draw impossible", () => {
    // Nobody may give to 3, so 3 can never receive a gift.
    const exclusions = new Map([[1, [3]], [2, [3]]]);
    assert.throws(
        () => drawAssignments([1, 2, 3], "x", exclusions),
        (err: unknown) =>
            err instanceof ValidationError && err.code === DRAW_IMPOSSIBLE
    );
});
