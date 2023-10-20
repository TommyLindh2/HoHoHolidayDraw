import { DbStorage } from "./interface";
import * as models from "../models";

export function InitializeDefaultPersons(storage: DbStorage) {
    const persons: Partial<models.Person>[] = [
        {
            name: "Tommy",
            pictureUrl:
                "https://scontent-arn2-1.xx.fbcdn.net/v/t1.6435-1/35236973_10156021233264219_957563946485678080_n.jpg?stp=dst-jpg_p200x200&_nc_cat=100&ccb=1-7&_nc_sid=2b6aad&_nc_ohc=QjHnJrYF3fkAX95W31c&_nc_ht=scontent-arn2-1.xx&oh=00_AfBBsnVv4x8dq0EaYc8qjXD5Cl5wc6G9jPMsGQkuwuoLmA&oe=6558CE5B",
        },
        {
            name: "Sanna HL",
            pictureUrl:
                "https://scontent-arn2-1.xx.fbcdn.net/v/t1.6435-1/99013543_10217207605089601_5995178680496685056_n.jpg?stp=dst-jpg_p200x200&_nc_cat=108&ccb=1-7&_nc_sid=2b6aad&_nc_ohc=YiH3tAk9vE4AX9Yh6Vm&_nc_ht=scontent-arn2-1.xx&oh=00_AfBrz2-iTnzoXg0d5BxhBc40tZ9OSDRzno4Ezfeppz1lSQ&oe=6558FB06",
        },
        {
            name: "Tina",
            pictureUrl: "",
        },
        {
            name: "Annie",
        },
        {
            name: "Lena",
        },
        {
            name: "Anders",
        },
        {
            name: "Tobias",
        },
        {
            name: "P-O",
        },
        {
            name: "Anna-Lena",
        },
        {
            name: "Göran",
        },
        {
            name: "Jenny",
        },
        {
            name: "Katrin",
        },
        {
            name: "Stefan",
        },
        {
            name: "David",
        },
        {
            name: "Sanna K",
        },
        {
            name: "William",
        },
        {
            name: "Isac",
        },
        {
            name: "Ingrid",
        },
        {
            name: "Rune",
        },
    ];

    for (let i = 0; i < persons.length; i++) {
        persons[i] = storage.CreatePerson(persons[i]);
    }

    const groups: Partial<models.Group>[] = [
        {
            name: "Hemma hos Tommys familj",
        },
        {
            name: "Hemma hos Sannas familj (förmiddag & Kväll)",
        },
        {
            name: "Hemma hos Sannas familj (kväll)",
        },
    ];

    for (let i = 0; i < groups.length; i++) {
        groups[i] = storage.CreateGroup(groups[i]);
    }

    const groupBelongings = new Map<number, number[]>();

    groupBelongings.set(
        groups[0].id as number,
        [
            "Tommy",
            "Sanna HL",
            "Tina",
            "Annie",
            "Lena",
            "Anders",
            "Tobias",
            "P-O",
            "Anna-Lena",
        ].map((name) => persons.find((p) => p.name == name)?.id ?? -1)
    );

    groupBelongings.set(
        groups[1].id as number,
        [
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
        ].map((name) => persons.find((p) => p.name == name)?.id ?? -1)
    );

    groupBelongings.set(
        groups[1].id as number,
        [
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
        ].map((name) => persons.find((p) => p.name == name)?.id ?? -1)
    );

    groupBelongings.forEach((personIds, groupId) => {
        storage.AddPersonsToGroup(groupId, personIds);
    });
}
