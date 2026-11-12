import assert from "node:assert/strict";
import { AddressInfo } from "node:net";
import { after, before, test } from "node:test";
import { createApp } from "./createApp";
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

test("rejects invalid input and unknown members with useful status codes", async () => {
    assert.equal((await send("POST", "person", { name: "  " })).status, 400);
    assert.equal(
        (await send("POST", "group", { name: "G", personIds: [999] })).status,
        404
    );
});
