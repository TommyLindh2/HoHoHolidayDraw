import * as models from "../models";

export interface DbStorage {
    GetPersons: () => models.Person[];
    GetPersonById: (personId: number) => models.Person;

    GetGroups: () => models.Group[];
    GetGroupById: (groupId: number) => models.Group;

    GetPersonsByGroup: (groupId: number) => models.Person[];

    CreatePerson: (person: Partial<models.Person>) => models.Person;
    UpdatePerson: (person: Partial<models.Person>) => models.Person;

    CreateGroup: (group: Partial<models.Group>) => models.Group;
    UpdateGroup: (group: Partial<models.Group>) => models.Group;

    AddPersonsToGroup: (groupId: number, personIds: number[]) => models.Group;
}
