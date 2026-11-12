export interface Group {
    readonly id: number;
    readonly name: string;
    readonly personIds: readonly number[];
}

export interface GroupInput {
    readonly name: string;
    readonly personIds: readonly number[];
}
