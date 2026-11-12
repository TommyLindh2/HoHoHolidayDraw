import { ValidationError } from "../errors";
import { Assignment } from "../models";
import { createRandom, RandomFn, shuffle } from "./random";

/** giverId -> ids the giver must not give to. */
export type Exclusions = ReadonlyMap<number, Iterable<number>>;

export const DRAW_IMPOSSIBLE = "draw_impossible";

/** Random reshuffles to try before switching to a search. */
const MAX_RESHUFFLES = 1000;
/** Upper bound for the search, so a hopeless group can't hang the server. */
const MAX_SEARCH_STEPS = 1_000_000;

/**
 * Decides who gives to whom. Nobody gets themselves or anyone on their
 * exclusion list.
 *
 * The result depends only on the seed, the set of person ids and the
 * exclusions, so the same input always gives the same draw. The returned
 * order is the order the frontend reveals the pairs in, and is also seeded.
 */
export function drawAssignments(
    personIds: Iterable<number>,
    seed: string,
    exclusions: Exclusions = new Map()
): Assignment[] {
    // Sort so the result doesn't depend on the order ids happen to be stored in.
    const givers = [...new Set(personIds)].sort((a, b) => a - b);
    if (givers.length < 2) {
        throw new ValidationError("A draw needs at least two persons");
    }

    const blocked = new Map(
        givers.map((id) => [id, new Set([id, ...(exclusions.get(id) ?? [])])])
    );
    const isAllowed = (giverId: number, receiverId: number): boolean =>
        !blocked.get(giverId)?.has(receiverId);

    const random = createRandom(seed);
    const receivers =
        reshuffleUntilValid(givers, isAllowed, random) ??
        searchValid(givers, isAllowed, random);
    if (!receivers) {
        throw new ValidationError(
            "No valid draw is possible with the current exclusions",
            DRAW_IMPOSSIBLE
        );
    }

    const assignments = givers.map((giverId, i) => ({
        giverId,
        receiverId: receivers[i] as number,
    }));

    return shuffle(assignments, random);
}

/**
 * Reshuffles until every pair is allowed. Every valid draw is equally likely
 * this way. Without exclusions roughly 1 in e shuffles qualifies, so this
 * normally takes a few rounds.
 */
function reshuffleUntilValid(
    givers: readonly number[],
    isAllowed: (giverId: number, receiverId: number) => boolean,
    random: RandomFn
): number[] | null {
    for (let attempt = 0; attempt < MAX_RESHUFFLES; attempt++) {
        const receivers = shuffle(givers, random);
        if (receivers.every((receiverId, i) => isAllowed(givers[i] as number, receiverId))) {
            return receivers;
        }
    }
    return null;
}

/**
 * Fallback when exclusions make random hits rare: a backtracking search over
 * randomly ordered candidates. Finds a draw whenever one exists (within the
 * step limit). Givers with the fewest options go first to prune early.
 */
function searchValid(
    givers: readonly number[],
    isAllowed: (giverId: number, receiverId: number) => boolean,
    random: RandomFn
): number[] | null {
    const candidates = new Map(
        givers.map((giverId) => [
            giverId,
            shuffle(givers.filter((r) => isAllowed(giverId, r)), random),
        ])
    );
    const order = [...givers].sort(
        (a, b) => candidates.get(a)!.length - candidates.get(b)!.length || a - b
    );

    const receiverOf = new Map<number, number>();
    const taken = new Set<number>();
    let steps = 0;

    const assign = (index: number): boolean => {
        if (index === order.length) {
            return true;
        }
        const giverId = order[index] as number;
        for (const receiverId of candidates.get(giverId)!) {
            if (taken.has(receiverId)) {
                continue;
            }
            if (++steps > MAX_SEARCH_STEPS) {
                return false;
            }
            taken.add(receiverId);
            receiverOf.set(giverId, receiverId);
            if (assign(index + 1)) {
                return true;
            }
            taken.delete(receiverId);
            receiverOf.delete(giverId);
        }
        return false;
    };

    return assign(0) ? givers.map((giverId) => receiverOf.get(giverId)!) : null;
}
