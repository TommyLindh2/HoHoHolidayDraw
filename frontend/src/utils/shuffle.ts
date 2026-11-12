export type RandomFn = () => number;

/** Fisher-Yates. Returns a new array. */
export function shuffle<T>(items: readonly T[], random: RandomFn = Math.random): T[] {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

/** Keeps rows before `fromRow` and shuffles the rest. */
function shuffleFrom(order: readonly number[], fromRow: number, random: RandomFn): number[] {
    return [...order.slice(0, fromRow), ...shuffle(order.slice(fromRow), random)];
}

/**
 * One animation frame: shuffles both sides from `fromRow` onwards. These
 * frames are only for show; the real result comes from the backend. Tries a
 * few times to avoid showing someone giving to themselves, then gives up
 * rather than looping forever.
 */
export function decoyShuffle(
    left: readonly number[],
    right: readonly number[],
    fromRow: number,
    random: RandomFn = Math.random
): [number[], number[]] {
    let result: [number[], number[]] = [[...left], [...right]];
    for (let attempt = 0; attempt < 10; attempt++) {
        result = [shuffleFrom(left, fromRow, random), shuffleFrom(right, fromRow, random)];
        const [newLeft, newRight] = result;
        if (!newLeft.some((id, row) => row >= fromRow && id === newRight[row])) {
            break;
        }
    }
    return result;
}

/** Moves `id` to `row`, keeping the rows before it in place. */
function placeAt(order: readonly number[], row: number, id: number): number[] {
    const rest = order.slice(row).filter(other => other !== id);
    return [...order.slice(0, row), id, ...rest];
}

/**
 * The last animation frame for a row: locks the real giver and receiver into
 * `row` and decoy-shuffles the rows below it.
 */
export function revealRow(
    left: readonly number[],
    right: readonly number[],
    row: number,
    giverId: number,
    receiverId: number,
    random: RandomFn = Math.random
): [number[], number[]] {
    return decoyShuffle(
        placeAt(left, row, giverId),
        placeAt(right, row, receiverId),
        row + 1,
        random
    );
}
