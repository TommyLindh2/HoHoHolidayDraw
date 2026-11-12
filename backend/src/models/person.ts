export interface Person {
    id: number;
    name: string;
    pictureUrl?: string;
}

export interface PersonInput {
    name: string;
    pictureUrl?: string;
}

/** `pictureUrl: null` clears the picture. */
export interface PersonUpdate {
    name?: string;
    pictureUrl?: string | null;
}
