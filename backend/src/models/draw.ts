export interface Assignment {
    giverId: number;
    receiverId: number;
}

export interface DrawResult {
    seed: string;
    /** Ordered as they should be revealed. */
    assignments: Assignment[];
}
