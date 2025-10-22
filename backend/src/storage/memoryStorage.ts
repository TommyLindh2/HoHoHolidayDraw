import { NotFoundError } from "../errors";
import { Person, Group } from "../models";
import { DbStorage } from "./interface";

export class MemoryStorage implements DbStorage {
    static GlobalIdCounter = 0;

    private getId = () => {
        return (MemoryStorage.GlobalIdCounter += 1);
    };

    readonly persons: Person[] = [];
    readonly groups: Person[] = [];
    readonly groupBelongings: Record<number, number[]> = {};

    public GetPersons = (): Person[] => {
        return this.persons;
    };

    public GetPersonById = (personId: number): Person => {
        const person = this.persons.find((p) => p.id === personId);

        if (!person) {
            throw new NotFoundError("Person", "id", personId);
        }

        return person;
    };

    public GetGroups = (): Group[] => {
        return this.groups;
    };

    public GetGroupById = (groupId: number): Group => {
        const group = this.groups.find((g) => g.id === groupId) ?? null;

        if (!group) {
            throw new NotFoundError("Group", "id", groupId);
        }

        return group;
    };

    public GetPersonsByGroup = (groupId: number): Person[] => {
        const personIds = this.groupBelongings[groupId] ?? [];

        return this.persons.filter((p) => personIds.includes(p.id));
    };

    public CreatePerson = (person: Partial<Person>): Person => {
        const newPerson = {
            ...person,
            id: this.getId(),
        } as Person;
        this.persons.push(newPerson);

        return newPerson;
    };

    public UpdatePerson = (person: Partial<Person>): Person => {
        const foundIndex = this.persons.findIndex((p) => p.id === person?.id);
        if (foundIndex < 0) {
            throw new NotFoundError("Person", "id", person?.id);
        }

        this.persons[foundIndex] = {
            ...this.persons[foundIndex] as Person,
            ...person,
        };

        return this.persons[foundIndex];
    };

    public CreateGroup = (group: Partial<Group>): Group => {
        const newGroup = {
            ...group,
            id: this.getId(),
        } as Group;
        this.groups.push(newGroup);

        return newGroup;
    };

    public UpdateGroup = (group: Partial<Group>): Group => {
        const foundIndex = this.groups.findIndex((p) => p.id === group?.id);
        if (foundIndex < 0) {
            throw new NotFoundError("Group", "id", group?.id);
        }

        this.groups[foundIndex] = {
            ...this.groups[foundIndex] as Group,
            ...group,
        };

        return this.groups[foundIndex];
    };

    public AddPersonsToGroup = (
        groupId: number,
        personIds: number[]
    ): Group => {
        const foundGroup = this.groups.find((p) => p.id === groupId);
        if (!foundGroup) {
            throw new NotFoundError("Group", "id", groupId);
        }

        const invalidPersonIds = personIds.filter(
            (personId) => !this.persons.find((p) => p.id === personId)
        );

        if (invalidPersonIds.length) {
            throw new NotFoundError("Person", "id", invalidPersonIds);
        }

        const existingGroupBelongings = this.groupBelongings[groupId] ?? [];
        this.groupBelongings[groupId] = Array.from(
            new Set(existingGroupBelongings.concat(personIds))
        );

        return foundGroup;
    };
}
