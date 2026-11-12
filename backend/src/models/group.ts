export interface Group {
    id: number;
    name: string;
    personIds: number[];
}

export interface GroupInput {
    name: string;
    personIds: readonly number[];
}

export type GroupUpdate = Partial<GroupInput>;
