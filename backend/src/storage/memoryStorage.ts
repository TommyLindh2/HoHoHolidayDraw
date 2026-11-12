import { NotFoundError, ValidationError } from "../errors";
import {
    Exclusion,
    Group,
    GroupInput,
    GroupUpdate,
    Person,
    PersonInput,
    PersonUpdate,
} from "../models";
import { DbStorage } from "./interface";

export interface StorageData {
    nextId: number;
    persons: Person[];
    groups: Group[];
}

export const emptyStorageData = (): StorageData => ({
    nextId: 1,
    persons: [],
    groups: [],
});

export class MemoryStorage implements DbStorage {
    protected readonly data: StorageData;

    constructor(initialData: StorageData = emptyStorageData()) {
        this.data = initialData;
        // Files written by older versions have no group exclusions.
        for (const group of this.data.groups) {
            group.exclusions ??= [];
        }
        // Exclusions used to be stored per person.
        for (const person of this.data.persons) {
            delete (person as Person & { excludedIds?: unknown }).excludedIds;
        }
    }

    /** Called after every mutation. Override to persist the data. */
    protected persist(): void {}

    private nextId(): number {
        return this.data.nextId++;
    }

    private findPerson(personId: number): Person {
        const person = this.data.persons.find((p) => p.id === personId);
        if (!person) {
            throw new NotFoundError("Person", "id", personId);
        }
        return person;
    }

    private findGroup(groupId: number): Group {
        const group = this.data.groups.find((g) => g.id === groupId);
        if (!group) {
            throw new NotFoundError("Group", "id", groupId);
        }
        return group;
    }

    private uniqueExistingPersonIds(personIds: Iterable<number>): number[] {
        const unique = [...new Set(personIds)];
        unique.forEach((id) => this.findPerson(id));
        return unique;
    }

    /** Rejects exclusions that don't make sense, and drops duplicates. */
    private validExclusions(
        personIds: readonly number[],
        exclusions: readonly Exclusion[]
    ): Exclusion[] {
        const unique = new Map<string, Exclusion>();
        for (const { giverId, receiverId } of exclusions) {
            if (giverId === receiverId) {
                throw new ValidationError("A person can't exclude themselves");
            }
            if (!personIds.includes(giverId) || !personIds.includes(receiverId)) {
                throw new ValidationError(
                    "Exclusions can only refer to members of the group"
                );
            }
            unique.set(`${giverId}:${receiverId}`, { giverId, receiverId });
        }
        return [...unique.values()];
    }

    /** Drops exclusions that refer to persons no longer in the group. */
    private pruneExclusions(group: Group): void {
        group.exclusions = group.exclusions.filter(
            ({ giverId, receiverId }) =>
                group.personIds.includes(giverId) &&
                group.personIds.includes(receiverId)
        );
    }

    public GetPersons(): Person[] {
        return structuredClone(this.data.persons);
    }

    public GetPersonById(personId: number): Person {
        return structuredClone(this.findPerson(personId));
    }

    public CreatePerson(input: PersonInput): Person {
        const person: Person = { id: this.nextId(), name: input.name };
        if (input.pictureUrl) {
            person.pictureUrl = input.pictureUrl;
        }
        this.data.persons.push(person);
        this.persist();
        return structuredClone(person);
    }

    public UpdatePerson(personId: number, update: PersonUpdate): Person {
        const person = this.findPerson(personId);
        if (update.name !== undefined) {
            person.name = update.name;
        }
        if (update.pictureUrl === null) {
            delete person.pictureUrl;
        } else if (update.pictureUrl !== undefined) {
            person.pictureUrl = update.pictureUrl;
        }
        this.persist();
        return structuredClone(person);
    }

    public DeletePerson(personId: number): void {
        this.findPerson(personId);
        this.data.persons = this.data.persons.filter((p) => p.id !== personId);
        for (const group of this.data.groups) {
            group.personIds = group.personIds.filter((id) => id !== personId);
            this.pruneExclusions(group);
        }
        this.persist();
    }

    public GetGroups(): Group[] {
        return structuredClone(this.data.groups);
    }

    public GetGroupById(groupId: number): Group {
        return structuredClone(this.findGroup(groupId));
    }

    public CreateGroup(input: GroupInput): Group {
        const personIds = this.uniqueExistingPersonIds(input.personIds);
        const group: Group = {
            id: this.nextId(),
            name: input.name,
            personIds,
            exclusions: this.validExclusions(personIds, input.exclusions ?? []),
        };
        this.data.groups.push(group);
        this.persist();
        return structuredClone(group);
    }

    public UpdateGroup(groupId: number, update: GroupUpdate): Group {
        const group = this.findGroup(groupId);
        const personIds =
            update.personIds !== undefined
                ? this.uniqueExistingPersonIds(update.personIds)
                : group.personIds;
        // Validate before changing anything, so a bad request changes nothing.
        const exclusions =
            update.exclusions !== undefined
                ? this.validExclusions(personIds, update.exclusions)
                : undefined;

        group.personIds = personIds;
        if (exclusions) {
            group.exclusions = exclusions;
        } else {
            this.pruneExclusions(group);
        }
        if (update.name !== undefined) {
            group.name = update.name;
        }
        this.persist();
        return structuredClone(group);
    }

    public DeleteGroup(groupId: number): void {
        this.findGroup(groupId);
        this.data.groups = this.data.groups.filter((g) => g.id !== groupId);
        this.persist();
    }

    public GetPersonsByGroup(groupId: number): Person[] {
        const { personIds } = this.findGroup(groupId);
        return structuredClone(
            this.data.persons.filter((p) => personIds.includes(p.id))
        );
    }

    public AddPersonToGroup(groupId: number, personId: number): Group {
        const group = this.findGroup(groupId);
        group.personIds = this.uniqueExistingPersonIds([
            ...group.personIds,
            personId,
        ]);
        this.persist();
        return structuredClone(group);
    }

    public RemovePersonFromGroup(groupId: number, personId: number): Group {
        const group = this.findGroup(groupId);
        this.findPerson(personId);
        group.personIds = group.personIds.filter((id) => id !== personId);
        this.pruneExclusions(group);
        this.persist();
        return structuredClone(group);
    }
}
