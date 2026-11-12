/** Within a group, `giverId` must never give a gift to `receiverId`. */
export interface Exclusion {
    giverId: number;
    receiverId: number;
}

export interface Group {
    id: number;
    name: string;
    personIds: number[];
    exclusions: Exclusion[];
}

export interface GroupInput {
    name: string;
    personIds: readonly number[];
    exclusions?: readonly Exclusion[];
}

export type GroupUpdate = Partial<GroupInput>;
