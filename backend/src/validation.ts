import { ValidationError } from "./errors";
import {
    Exclusion,
    GroupInput,
    GroupUpdate,
    PersonInput,
    PersonUpdate,
} from "./models";

const MAX_NAME_LENGTH = 100;
const MAX_URL_LENGTH = 2000;
const MAX_SEED_LENGTH = 64;

type Body = Record<string, unknown>;

function asBody(body: unknown): Body {
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
        throw new ValidationError("Request body must be a JSON object");
    }
    return body as Body;
}

export function parseId(raw: string, label = "ID"): number {
    const id = Number(raw);
    if (!Number.isInteger(id) || id <= 0) {
        throw new ValidationError(`Invalid ${label}. Must be a positive integer.`);
    }
    return id;
}

function parseName(value: unknown): string {
    if (typeof value !== "string" || value.trim() === "") {
        throw new ValidationError("name is required");
    }
    const name = value.trim();
    if (name.length > MAX_NAME_LENGTH) {
        throw new ValidationError(
            `name can be at most ${MAX_NAME_LENGTH} characters`
        );
    }
    return name;
}

/** Empty string and null both mean "no picture". */
function parsePictureUrl(value: unknown): string | null {
    if (value === null || value === "") {
        return null;
    }
    if (typeof value !== "string" || value.length > MAX_URL_LENGTH) {
        throw new ValidationError("pictureUrl must be a string");
    }
    return value.trim() || null;
}

const isId = (value: unknown): value is number =>
    Number.isInteger(value) && (value as number) > 0;

function parsePersonIds(value: unknown): number[] {
    if (!Array.isArray(value) || !value.every(isId)) {
        throw new ValidationError("personIds must be an array of person IDs");
    }
    return value as number[];
}

export function parsePersonInput(raw: unknown): PersonInput {
    const body = asBody(raw);
    const input: PersonInput = { name: parseName(body.name) };
    const pictureUrl =
        body.pictureUrl === undefined ? null : parsePictureUrl(body.pictureUrl);
    if (pictureUrl) {
        input.pictureUrl = pictureUrl;
    }
    return input;
}

export function parsePersonUpdate(raw: unknown): PersonUpdate {
    const body = asBody(raw);
    const update: PersonUpdate = {};
    if (body.name !== undefined) {
        update.name = parseName(body.name);
    }
    if (body.pictureUrl !== undefined) {
        update.pictureUrl = parsePictureUrl(body.pictureUrl);
    }
    return update;
}

function parseExclusions(value: unknown): Exclusion[] {
    const isExclusion = (item: unknown): boolean =>
        typeof item === "object" &&
        item !== null &&
        isId((item as Body).giverId) &&
        isId((item as Body).receiverId);

    if (!Array.isArray(value) || !value.every(isExclusion)) {
        throw new ValidationError(
            "exclusions must be an array of { giverId, receiverId }"
        );
    }
    return value.map(({ giverId, receiverId }) => ({ giverId, receiverId }));
}

export function parseGroupInput(raw: unknown): GroupInput {
    const body = asBody(raw);
    const input: GroupInput = {
        name: parseName(body.name),
        personIds:
            body.personIds === undefined ? [] : parsePersonIds(body.personIds),
    };
    if (body.exclusions !== undefined) {
        input.exclusions = parseExclusions(body.exclusions);
    }
    return input;
}

export function parseGroupUpdate(raw: unknown): GroupUpdate {
    const body = asBody(raw);
    const update: GroupUpdate = {};
    if (body.name !== undefined) {
        update.name = parseName(body.name);
    }
    if (body.personIds !== undefined) {
        update.personIds = parsePersonIds(body.personIds);
    }
    if (body.exclusions !== undefined) {
        update.exclusions = parseExclusions(body.exclusions);
    }
    return update;
}

/** Returns undefined when no seed was given, so the caller can generate one. */
export function parseSeed(value: unknown): string | undefined {
    if (value === undefined) {
        return undefined;
    }
    if (typeof value !== "string" || value.length > MAX_SEED_LENGTH) {
        throw new ValidationError(
            `seed must be a string of at most ${MAX_SEED_LENGTH} characters`
        );
    }
    return value.trim() || undefined;
}
