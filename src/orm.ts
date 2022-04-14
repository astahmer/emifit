import { IDBPDatabase, openDB } from "idb";
import { del, get, update } from "idb-keyval";
import { DailyWithReferences, ExerciseWithReferences, ProgramWithReferences } from "./orm-types";

// https://www.npmjs.com/package/idb#opendb
const version = Number(import.meta.env.VITE_APP_VERSION);
let db: IDBPDatabase<EmifitSchema>;

export async function makeDb() {
    db = await openDB<EmifitSchema>("emifit-db", version, {
        upgrade(db, oldVersion, newVersion, transaction) {
            console.log(db, oldVersion, newVersion, transaction);
            const daily = db.createObjectStore("daily", { keyPath: "id" });
            daily.createIndex("by-time", "time");

            const exercise = db.createObjectStore("exercise", { keyPath: "id" });
            exercise.createIndex("by-name", "name");

            const program = db.createObjectStore("program", { keyPath: "id" });
            program.createIndex("by-name", "name");

            db.createObjectStore("keyval");
        },
    });
    orm.db = db;
    return db;
}

interface EmifitSchema {
    daily: {
        key: DailyWithReferences["id"];
        value: DailyWithReferences;
        indexes: { "by-id": DailyWithReferences["id"] };
    };
    program: {
        key: ProgramWithReferences["id"];
        value: ProgramWithReferences;
        indexes: { "by-name": ProgramWithReferences["name"] };
    };
    exercise: {
        key: ExerciseWithReferences["id"];
        value: ExerciseWithReferences;
        indexes: { "by-name": ExerciseWithReferences["name"] };
    };
    keyval: {
        value: any;
        key: number;
    };
}

interface Entity {
    id: string;
}

const makeStore = <T extends Entity = Entity, Key extends keyof EmifitSchema = keyof EmifitSchema>(name: Key) => {
    return {
        name,
        tx: (mode?: IDBTransactionMode, options?: IDBTransactionOptions) => db.transaction(name, mode, options),
        find: (id: T["id"]) => db.get(name, id) as Promise<T>,
        get: (() => db.getAll(name)) as () => Promise<T[]>,
        keys: () => db.getAllKeys(name),
        count: () => db.count(name),
        getLast: async () => {
            const tx = db.transaction(name);
            const index = tx.store.index("by-id");
            let last;

            // TODO
            for await (const cursor of index.iterate(undefined, "prev")) {
                console.log(cursor.value);
                // Skip the next item
                cursor.advance(2);
                last = cursor.value;
                console.log(cursor.value);
            }

            return last;
        },
        add: (value: T) => db.add(name, value),
        put: (value: T) => db.put(name, value),
        upsert: async (key: string, setterOrUpdate: Partial<T> | ((current: T) => T)) => {
            const tx = db.transaction(name, "readwrite");
            const current = (await tx.store.get(key)) as T;
            const update =
                typeof setterOrUpdate === "function" ? setterOrUpdate(current) : { ...current, ...setterOrUpdate };
            await tx.store.put(update);
            return tx.done;
        },
        delete: (id: T["id"]) => db.delete(name, id),
    };
};

const makeKeyValue = <T, Key extends string = string>(key: Key) => {
    return {
        type: "keyValue" as const,
        key,
        get: () => get<T>(key),
        set: (value: T) => update<T>(key, () => value),
        remove: () => del(key),
    };
};

export const orm = {
    db,
    version,
    exercise: makeStore<ExerciseWithReferences>("exercise"),
    program: makeStore<ProgramWithReferences>("program"),
    daily: makeStore<DailyWithReferences>("daily"),
    programListOrder: makeKeyValue<string[], "programListOrder">("programListOrder"),
};

interface IDBTransactionOptions {
    /**
     * The durability of the transaction.
     *
     * The default is "default". Using "relaxed" provides better performance, but with fewer
     * guarantees. Web applications are encouraged to use "relaxed" for ephemeral data such as caches
     * or quickly changing records, and "strict" in cases where reducing the risk of data loss
     * outweighs the impact to performance and power.
     */
    durability?: "default" | "strict" | "relaxed";
}
