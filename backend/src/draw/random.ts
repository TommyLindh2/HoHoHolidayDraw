import { randomInt } from "node:crypto";

export type RandomFn = () => number;

/** FNV-1a: turns any seed string into a 32-bit integer. */
export function hashSeed(seed: string): number {
    let hash = 0x811c9dc5;
    for (let i = 0; i < seed.length; i++) {
        hash ^= seed.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193);
    }
    return hash >>> 0;
}

/** Mulberry32: small, fast PRNG returning floats in [0, 1). Same seed, same sequence. */
export function mulberry32(seed: number): RandomFn {
    let state = seed >>> 0;
    return () => {
        state = (state + 0x6d2b79f5) | 0;
        let t = Math.imul(state ^ (state >>> 15), 1 | state);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export function createRandom(seed: string): RandomFn {
    return mulberry32(hashSeed(seed));
}

/** A short, easy-to-type seed such as "k3x9q2". */
export function generateSeed(): string {
    return randomInt(36 ** 6)
        .toString(36)
        .padStart(6, "0");
}

/** Fisher-Yates shuffle. Returns a new array. */
export function shuffle<T>(items: readonly T[], random: RandomFn): T[] {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [result[i], result[j]] = [result[j] as T, result[i] as T];
    }
    return result;
}
