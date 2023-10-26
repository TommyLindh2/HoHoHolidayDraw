import { DbStorage } from "./interface";
import * as models from "../models";

export function InitializeDefaultPersons(storage: DbStorage) {
    const profilesPrefix = "/assets/profiles/";
    const persons: Partial<models.Person>[] = [
        {
            name: "Tommy",
            pictureUrl: profilesPrefix + "tommy.jpg",
        },
        {
            name: "Sanna HL",
            pictureUrl: profilesPrefix + "sanna_hl.jpg",
        },
        {
            name: "Tina",
            pictureUrl: profilesPrefix + "tina.jpg",
        },
        {
            name: "Annie",
            pictureUrl: profilesPrefix + "annie.jpg",
        },
        {
            name: "Lena",
            pictureUrl: profilesPrefix + "lena.jpg",
        },
        {
            name: "Anders",
        },
        {
            name: "Tobias",
        },
        {
            name: "P-O",
            pictureUrl: profilesPrefix + "po.jpg",
        },
        {
            name: "Annalena",
            pictureUrl: profilesPrefix + "annalena.jpg",
        },
        {
            name: "Göran",
            pictureUrl: profilesPrefix + "goran.jpg",
        },
        {
            name: "Jenny",
            pictureUrl: profilesPrefix + "jenny.jpg",
        },
        {
            name: "Katrin",
            pictureUrl: profilesPrefix + "katrin.jpg",
        },
        {
            name: "Stefan",
            pictureUrl: profilesPrefix + "stefan.jpg",
        },
        {
            name: "David",
            pictureUrl: profilesPrefix + "david.jpg",
        },
        {
            name: "Sanna K",
            pictureUrl: profilesPrefix + "sanna_k.jpg",
        },
        {
            name: "William",
            pictureUrl: profilesPrefix + "william.jpg",
        },
        {
            name: "Isac",
            pictureUrl: profilesPrefix + "isac.jpg",
        },
        {
            name: "Ingrid",
            pictureUrl: profilesPrefix + "ingrid.jpg",
        },
        {
            name: "Rune",
        },
    ];

    for (let i = 0; i < persons.length; i++) {
        persons[i] = storage.CreatePerson(persons[i]);
    }

    const groups: Array<Partial<models.Group> & { persons?: string[] }> = [
        {
            name: "Lindharna",
            persons: [
                "Tommy",
                "Sanna HL",
                "Tina",
                "Annie",
                "Lena",
                "Anders",
                "Tobias",
                "P-O",
                "Annalena",
            ],
        },
        {
            name: "Åkerbotorp",
            persons: [
                "Tommy",
                "Sanna HL",
                "Göran",
                "Jenny",
                "Katrin",
                "Stefan",
                "David",
                "Sanna K",
                "William",
                "Isac",
            ],
        },
        {
            name: "Milleshuset",
            persons: [
                "Tommy",
                "Sanna HL",
                "Göran",
                "Jenny",
                "Katrin",
                "Stefan",
                "David",
                "Sanna K",
                "William",
                "Isac",
                "Ingrid",
                "Rune",
            ],
        },
    ];

    for (let i = 0; i < groups.length; i++) {
        const group = groups[i];
        const groupBelongings = group?.persons ?? [];
        delete group.persons;

        const createdGroup = storage.CreateGroup(group);
        groups[i] = createdGroup;

        storage.AddPersonsToGroup(
            createdGroup.id,
            groupBelongings.map(
                (name) => persons.find((p) => p.name == name)?.id ?? -1
            )
        );
    }
}
