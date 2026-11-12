import * as models from "../models";

export interface DbStorage {
    GetPersons(): models.Person[];
    GetPersonById(personId: number): models.Person;
    CreatePerson(person: models.PersonInput): models.Person;
    UpdatePerson(personId: number, update: models.PersonUpdate): models.Person;
    /** Also removes the person from every group. */
    DeletePerson(personId: number): void;

    GetGroups(): models.Group[];
    GetGroupById(groupId: number): models.Group;
    CreateGroup(group: models.GroupInput): models.Group;
    UpdateGroup(groupId: number, update: models.GroupUpdate): models.Group;
    DeleteGroup(groupId: number): void;

    GetPersonsByGroup(groupId: number): models.Person[];
    AddPersonToGroup(groupId: number, personId: number): models.Group;
    RemovePersonFromGroup(groupId: number, personId: number): models.Group;
}
