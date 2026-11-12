import { ValidationError } from "../errors";
import { Assignment } from "../models";
import { createRandom, shuffle } from "./random";

/**
 * Decides who gives to whom. Nobody gets themselves.
 *
 * The result depends only on the seed and the set of person ids, so the same
 * seed on the same group always gives the same draw. The returned order is
 * the order the frontend reveals the pairs in, and is also seeded.
 */
export function drawAssignments(
    personIds: Iterable<number>,
    seed: string
): Assignment[] {
    // Sort so the result doesn't depend on the order ids happen to be stored in.
    const givers = [...new Set(personIds)].sort((a, b) => a - b);
    if (givers.length < 2) {
        throw new ValidationError("A draw needs at least two persons");
    }

    const random = createRandom(seed);

    // Reshuffle until nobody draws themselves. Roughly 1 in e shuffles
    // qualifies, so this takes about 3 rounds on average.
    let receivers: number[];
    do {
        receivers = shuffle(givers, random);
    } while (receivers.some((receiverId, i) => receiverId === givers[i]));

    const assignments = givers.map((giverId, i) => ({
        giverId,
        receiverId: receivers[i] as number,
    }));

    return shuffle(assignments, random);
}
