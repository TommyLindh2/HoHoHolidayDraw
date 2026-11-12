export interface Assignment {
    readonly giverId: number;
    readonly receiverId: number;
}

export interface DrawResult {
    readonly seed: string;
    /** In the order the pairs should be revealed. */
    readonly assignments: readonly Assignment[];
}
