import path from "node:path";
import { createApp } from "./createApp";
import { FileStorage, InitializeDefaultPersons } from "./storage";

const port = process.env.PORT || 3001;
const dataFile =
    process.env.DATA_FILE || path.resolve(__dirname, "..", "data", "db.json");

const storage = FileStorage.Open(dataFile, InitializeDefaultPersons);

createApp(storage).listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Storing data in ${dataFile}`);
});
