import assert from "node:assert/strict";
import { AddressInfo } from "node:net";
import { after, before, test } from "node:test";
import { createApp } from "./createApp";
import { DrawResult, Group, Person } from "./models";
import { MemoryStorage } from "./storage";

let baseUrl = "";
let close: () => void = () => {};

before(async () => {
    const server = createApp(new MemoryStorage()).listen(0);
    await new Promise((resolve) => server.once("listening", resolve));
    baseUrl = `http://localhost:${(server.address() as AddressInfo).port}/api`;
    close = () => server.close();
});
after(() => close());

const send = (method: string, uri: string, body?: unknown) =>
    fetch(`${baseUrl}/${uri}`, {
        method,
        headers: { "Content-Type": "application/json" },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });

async function json<T>(response: Promise<Response>): Promise<T> {
    return (await response).json() as Promise<T>;
}

test("rejects invalid input and unknown members with useful status codes", async () => {
    assert.equal((await send("POST", "person", { name: "  " })).status, 400);
    assert.equal(
        (await send("POST", "group", { name: "G", personIds: [999] })).status,
        404
    );
    // Exclusions must be between members of the group.
    const anna = await json<Person>(send("POST", "person", { name: "Anna" }));
    const bo = await json<Person>(send("POST", "person", { name: "Bo" }));
    const outsider = { giverId: anna.id, receiverId: 999 };
    assert.equal(
        (
            await send("POST", "group", {
                name: "G",
                personIds: [anna.id, bo.id],
                exclusions: [outsider],
            })
        ).status,
        400
    );
});

test("draw endpoint returns its seed and repeats the draw for that seed", async () => {
    const ids: number[] = [];
    for (const name of ["A", "B", "C", "D"]) {
        ids.push((await json<Person>(send("POST", "person", { name }))).id);
    }
    const group = await json<Group>(
        send("POST", "group", { name: "G", personIds: ids })
    );

    const random = await json<DrawResult>(send("GET", `group/${group.id}/draw`));
    assert.match(random.seed, /^[0-9a-z]{6}$/);

    const again = await json<DrawResult>(
        send("GET", `group/${group.id}/draw?seed=${random.seed}`)
    );
    assert.deepEqual(again, random);
});
