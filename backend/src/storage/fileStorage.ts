import fs from "node:fs";
import path from "node:path";
import { DbStorage } from "./interface";
import { emptyStorageData, MemoryStorage, StorageData } from "./memoryStorage";

/**
 * Keeps everything in memory and writes the whole data set to a JSON file
 * after every change. Good enough for a handful of persons and groups.
 */
export class FileStorage extends MemoryStorage {
    private constructor(
        private readonly filePath: string,
        data: StorageData
    ) {
        super(data);
    }

    /**
     * Opens the storage file, or creates it (running `seed` on the fresh
     * storage) when it doesn't exist yet.
     */
    public static Open(
        filePath: string,
        seed?: (storage: DbStorage) => void
    ): FileStorage {
        if (fs.existsSync(filePath)) {
            const raw = fs.readFileSync(filePath, "utf-8");
            return new FileStorage(filePath, JSON.parse(raw) as StorageData);
        }

        const storage = new FileStorage(filePath, emptyStorageData());
        seed?.(storage);
        storage.persist();
        return storage;
    }

    protected override persist(): void {
        fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
        // Write to a temp file and rename so a crash never leaves a half-written file.
        const tmpPath = `${this.filePath}.tmp`;
        fs.writeFileSync(tmpPath, JSON.stringify(this.data, null, 4));
        fs.renameSync(tmpPath, this.filePath);
    }
}
