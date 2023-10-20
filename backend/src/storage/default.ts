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
            pictureUrl:
                "https://scontent-arn2-1.xx.fbcdn.net/v/t1.6435-1/194792129_10159066304526226_5772019461992449204_n.jpg?stp=dst-jpg_p200x200&_nc_cat=102&ccb=1-7&_nc_sid=2b6aad&_nc_ohc=4It8q08Fq0cAX_tE6vQ&_nc_ht=scontent-arn2-1.xx&oh=00_AfAWlS-azSooUWyIW2YQH-lX2D_Z3JyflEVFpD1l67qctQ&oe=6559A939",
        },
        {
            name: "Annie",
            pictureUrl:
                "https://scontent-arn2-1.xx.fbcdn.net/v/t39.30808-1/296283316_1201616807077675_6120368637985555439_n.jpg?stp=dst-jpg_p200x200&_nc_cat=105&ccb=1-7&_nc_sid=5f2048&_nc_ohc=YqOU1NIF5wUAX_FsPQx&_nc_ht=scontent-arn2-1.xx&oh=00_AfBv_qy84HAI3xv0krrsxrsB3jD6VtrnXqpcbcefhmCKFQ&oe=65363FF8",
        },
        {
            name: "Lena",
            pictureUrl:
                "https://scontent-arn2-1.xx.fbcdn.net/v/t39.30808-1/376827515_6940877335946390_6411796332436822083_n.jpg?stp=dst-jpg_p200x200&_nc_cat=108&ccb=1-7&_nc_sid=5f2048&_nc_ohc=yYMbuSKqdPwAX803sg6&_nc_ht=scontent-arn2-1.xx&oh=00_AfCH4EM2mA2BjLhHqexGRpokSXC8gCpq-nqsVOa4_Zccew&oe=6537960F",
        },
        {
            name: "Anders",
            pictureUrl: "",
        },
        {
            name: "Tobias",
            pictureUrl: "",
        },
        {
            name: "P-O",
            pictureUrl:
                "https://scontent-arn2-1.xx.fbcdn.net/v/t1.6435-9/67244490_10214198459107051_8712863908995530752_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=7a1959&_nc_ohc=JvqC4jM8pSwAX_gXkoE&_nc_ht=scontent-arn2-1.xx&oh=00_AfD4P9RtXO8iFTOg60-UePazOFOPZ9sOS4PVwSfJ7vGnZg&oe=65599ABD",
        },
        {
            name: "Anna-Lena",
            pictureUrl:
                "https://scontent-arn2-1.xx.fbcdn.net/v/t39.30808-1/276261672_660036105276811_1607184588110561188_n.jpg?stp=dst-jpg_p200x200&_nc_cat=106&ccb=1-7&_nc_sid=5f2048&_nc_ohc=xIbEVmBRDhgAX89BEjP&_nc_ht=scontent-arn2-1.xx&oh=00_AfDAu_wiE_rroML-ku6ZNJT1LR9IRmqzB973WHjadhcGXA&oe=6536DB85",
        },
        {
            name: "Göran",
            pictureUrl:
                "https://scontent-arn2-1.xx.fbcdn.net/v/t1.18169-9/28795631_10213992620868638_1714995398596393131_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=7a1959&_nc_ohc=ExBXQbG_d1YAX8yvPVN&_nc_ht=scontent-arn2-1.xx&oh=00_AfBIVtLYz-ZgHX3MXzR4n5rQyg3ZyiN9jnIJSgq7uty8Ow&oe=65599069",
        },
        {
            name: "Jenny",
            pictureUrl:
                "https://scontent-arn2-1.xx.fbcdn.net/v/t1.6435-1/60926422_10156076068911366_4256246714127613952_n.jpg?stp=c0.119.200.200a_dst-jpg_p200x200&_nc_cat=110&ccb=1-7&_nc_sid=2b6aad&_nc_ohc=8S8lr2A6s88AX-1j9Vn&_nc_ht=scontent-arn2-1.xx&oh=00_AfD_5q7mGbSfx38GPaUeHHpcuNd3QBt0e_59pWhKeUoFWg&oe=65598F08",
        },
        {
            name: "Katrin",
            pictureUrl:
                "https://scontent-arn2-1.xx.fbcdn.net/v/t39.30808-1/375908954_10228393535615875_919358805260278400_n.jpg?stp=dst-jpg_s200x200&_nc_cat=107&ccb=1-7&_nc_sid=5f2048&_nc_ohc=gCKCGViyAsIAX8RRWDA&_nc_ht=scontent-arn2-1.xx&oh=00_AfBIWRGr0HCr0x4Pi1AUeQ5TLi90eCVE8r9ATm8rMyqXRw&oe=6537945E",
        },
        {
            name: "Stefan",
            pictureUrl:
                "https://scontent-arn2-1.xx.fbcdn.net/v/t39.30808-1/343161218_1275489856724268_975362958663702061_n.jpg?stp=c0.0.200.200a_dst-jpg_p200x200&_nc_cat=101&ccb=1-7&_nc_sid=5f2048&_nc_ohc=siGaeM78rVYAX9Vo1As&_nc_ht=scontent-arn2-1.xx&oh=00_AfCZhnSQnEyM2r7cGpcwMscEO-lXaf-NLh2XWIA_C0oHDA&oe=6537181E",
        },
        {
            name: "David",
            pictureUrl:
                "https://scontent-arn2-1.xx.fbcdn.net/v/t1.6435-1/61923845_10156326058382717_1366279330795094016_n.jpg?stp=c0.65.200.200a_dst-jpg_p200x200&_nc_cat=109&ccb=1-7&_nc_sid=2b6aad&_nc_ohc=qZoZzmY5v0MAX8p3-DJ&_nc_ht=scontent-arn2-1.xx&oh=00_AfC2kgwSoJbh7zXaVvW9hx2KplNXTTr6FkNGHNGOGwRYlg&oe=6559B504",
        },
        {
            name: "Sanna K",
            pictureUrl:
                "https://scontent-arn2-1.xx.fbcdn.net/v/t1.6435-1/36278009_10216497834949145_5942204820155793408_n.jpg?stp=dst-jpg_p200x200&_nc_cat=107&ccb=1-7&_nc_sid=2b6aad&_nc_ohc=3DLIy-sNmLwAX9LNqSE&_nc_ht=scontent-arn2-1.xx&oh=00_AfANu2kc40gpgY2z8Z5Kk8zHdHVQ2nb_0orEQISgz1-edA&oe=6559B02C",
        },
        {
            name: "William",
            pictureUrl:
                "https://scontent-arn2-1.xx.fbcdn.net/v/t1.18169-1/10405378_10152906942532651_527450808283924915_n.jpg?stp=dst-jpg_p200x200&_nc_cat=101&ccb=1-7&_nc_sid=2b6aad&_nc_ohc=N1SKy5oVzroAX9j7a_H&_nc_ht=scontent-arn2-1.xx&oh=00_AfB0tid1LvlY4Ew4mIX1kakMzKIRjYrMUo5m1-FaD8LD7Q&oe=65599B1E",
        },
        {
            name: "Isac",
            pictureUrl:
                "https://scontent-arn2-1.xx.fbcdn.net/v/t31.18172-1/18623224_101504757107050_1336604696240088582_o.jpg?stp=dst-jpg_p200x200&_nc_cat=105&ccb=1-7&_nc_sid=2b6aad&_nc_ohc=S0yHQRZWj10AX_hlHWW&_nc_ht=scontent-arn2-1.xx&oh=00_AfDGJxO9wKuOXsa389ZwKA-z0cs_KWRuF3brWqqH2eCxgA&oe=6559B295",
        },
        {
            name: "Ingrid",
            pictureUrl:
                "https://scontent-arn2-1.xx.fbcdn.net/v/t39.30808-1/330565563_698931498684506_6521164988737691842_n.jpg?stp=dst-jpg_p200x200&_nc_cat=108&ccb=1-7&_nc_sid=5f2048&_nc_ohc=pZBi-j8Z-DUAX92sUgb&_nc_ht=scontent-arn2-1.xx&oh=00_AfAluiDAFu_sjH4VsXiJKE5MtLH9QL3KAeYoZUqydyQnAg&oe=6537667F",
        },
        {
            name: "Rune",
            pictureUrl: "",
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
