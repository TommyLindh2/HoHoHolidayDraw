import express, { Request, Response } from "express";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/api/data", (req: Request, res: Response) => {
    const data = { message: "Hello from the backend!" };
    res.json(data);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
