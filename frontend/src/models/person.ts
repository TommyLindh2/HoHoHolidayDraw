export interface Person {
    readonly id: number;
    readonly name: string;
    readonly pictureUrl?: string;
}

export interface PersonInput {
    readonly name: string;
    readonly pictureUrl?: string;
}

/** `pictureUrl: null` removes the picture. */
export interface PersonUpdate {
    readonly name?: string;
    readonly pictureUrl?: string | null;
}
