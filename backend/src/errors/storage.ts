type Entities = "Person" | "Group";
type Attributes = "id" | "name";

export class NotFoundError extends Error {
    constructor(
        public readonly entity: Entities,
        public readonly attribute: Attributes,
        public readonly lookupValue: unknown
    ) {
        super(`${entity} with ${attribute} ${String(lookupValue)} not found`);
    }
}
