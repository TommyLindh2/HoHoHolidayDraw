import express, { Request, Response } from "express";
import * as models from "./models";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

const peopleList: models.People[] = [
    {
        id: 1,
        name: "Tommy Hallman Lindh",
        pictureUrl:
            "https://scontent-arn2-1.xx.fbcdn.net/v/t1.6435-1/35236973_10156021233264219_957563946485678080_n.jpg?stp=dst-jpg_p200x200&_nc_cat=100&ccb=1-7&_nc_sid=2b6aad&_nc_ohc=QjHnJrYF3fkAX95W31c&_nc_ht=scontent-arn2-1.xx&oh=00_AfBBsnVv4x8dq0EaYc8qjXD5Cl5wc6G9jPMsGQkuwuoLmA&oe=6558CE5B",
    },
    {
        id: 2,
        name: "Sanna Hallman Lindh",
        pictureUrl:
            "https://scontent-arn2-1.xx.fbcdn.net/v/t1.6435-1/99013543_10217207605089601_5995178680496685056_n.jpg?stp=dst-jpg_p200x200&_nc_cat=108&ccb=1-7&_nc_sid=2b6aad&_nc_ohc=YiH3tAk9vE4AX9Yh6Vm&_nc_ht=scontent-arn2-1.xx&oh=00_AfBrz2-iTnzoXg0d5BxhBc40tZ9OSDRzno4Ezfeppz1lSQ&oe=6558FB06",
    },
    {
        id: 3,
        name: "David Lundgren",
    },
];

app.use(express.json());

app.get("/api/people", (req: Request, res: Response) => {
    return res.json({
        people: peopleList,
    });
});

app.get("/api/people/:id", (req: Request, res: Response) => {
    const requestedId = req.params.id;
    if (isNaN(requestedId as any)) {
        return res
            .status(400)
            .json({ error: "Invalid ID. ID must be a number." });
    }
    const peopleId = parseInt(req.params.id);

    const people = peopleList.find((p) => p.id === peopleId);
    if (!people) {
        return res.status(404).json({
            error: `People with ID: ${peopleId} not found`,
        });
    }

    return res.json(people);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
