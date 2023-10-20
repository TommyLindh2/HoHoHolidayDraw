type Entities = "Person" | "Group";
type Attributes = "id" | "name";

export class NotFoundError extends Error {
    constructor(
        public entity: Entities,
        public attribute: Attributes,
        public lookupValue: any
    ) {
        super(`NotFound - ${entity} by ${attribute}:${lookupValue}`);
    }
}
