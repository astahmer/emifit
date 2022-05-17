import { IDBPDatabase, IDBPTransaction, StoreNames } from "idb";
import type { EmifitSchema } from "./orm";

export const runMigrations: (
    database: IDBPDatabase<EmifitSchema>,
    oldVersion: number,
    newVersion: number | null,
    transaction: IDBPTransaction<EmifitSchema, StoreNames<EmifitSchema>[], "versionchange" | "readwrite">,
    onVersionMigrate?: (
        currentVersion: number,
        tx: IDBPTransaction<EmifitSchema, StoreNames<EmifitSchema>[], "versionchange" | "readwrite">
    ) => void | Promise<void>
) => Promise<void> = async (db, oldVersion, newVersion, transaction, onVersionMigrated) => {
    console.log({ db, oldVersion, newVersion, transaction });
    let migrationVersion = oldVersion;
    const isVersionChange = transaction.mode === "versionchange";

    console.log("start migrating");
    if (migrationVersion === 0 && isVersionChange) {
        console.log("create db object stores");
        const daily = db.createObjectStore("daily", { keyPath: "id" });
        daily.createIndex("by-time", "time");
        daily.createIndex("by-category", "category");
        daily.createIndex("by-program", "programId");

        const exercise = db.createObjectStore("exercise", { keyPath: "id" });
        exercise.createIndex("by-name", "name");
        exercise.createIndex("by-category", "category");
        exercise.createIndex("by-tags", "tags", { multiEntry: true });
        exercise.createIndex("by-parent", "madeFromExerciseId");

        const program = db.createObjectStore("program", { keyPath: "id" });
        program.createIndex("by-name", "name");
        program.createIndex("by-category", "category");

        db.createObjectStore("keyval");
        migrationVersion++;
        console.log("migrated to version", migrationVersion);
    }
    if (migrationVersion === 1) {
        const tx = transaction;

        await onVersionMigrated?.(migrationVersion, tx);
        let cursor = await tx.objectStore("daily").index("by-time").openCursor();

        while (cursor) {
            if (typeof cursor.value.date === "string") {
                cursor.update({ ...cursor.value, date: new Date(cursor.value.date) });
            }

            cursor = await cursor.continue();
        }
        migrationVersion++;
        console.log("migrated to version", migrationVersion);
    }

    console.log("done migrating");
};
