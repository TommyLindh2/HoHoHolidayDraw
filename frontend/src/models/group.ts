/** Within a group, `giverId` must never give a gift to `receiverId`. */
export interface Exclusion {
    readonly giverId: number;
    readonly receiverId: number;
}

export interface Group {
    readonly id: number;
    readonly name: string;
    readonly personIds: readonly number[];
    readonly exclusions: readonly Exclusion[];
}

export interface GroupInput {
    readonly name: string;
    readonly personIds: readonly number[];
    readonly exclusions?: readonly Exclusion[];
}
