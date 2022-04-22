import { IDBPDatabase, IndexKey, IndexNames, openDB, StoreKey } from "idb";
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
        },
    });
    orm.db = db;
    return db;
}

type EmifitSchema = {
    daily: {
        key: DailyWithReferences["id"];
        value: DailyWithReferences;
        indexes: {
            "by-time": DailyWithReferences["time"];
            "by-category": DailyWithReferences["category"];
            "by-program": DailyWithReferences["programId"];
        };
    };
    exercise: {
        key: ExerciseWithReferences["id"];
        value: ExerciseWithReferences;
        indexes: {
            "by-name": ExerciseWithReferences["name"];
            "by-category": ExerciseWithReferences["category"];
            "by-tags": ExerciseWithReferences["tags"];
            "by-parent": ExerciseWithReferences["madeFromExerciseId"];
        };
    };
    program: {
        key: ProgramWithReferences["id"];
        value: ProgramWithReferences;
        indexes: {
            "by-name": ProgramWithReferences["name"];
            "by-category": ProgramWithReferences["category"];
        };
    };
    keyval: {
        value: any;
        key: number;
        indexes: never;
    };
};

interface Entity {
    id: string;
}

type StoreName = keyof EmifitSchema;
export type StoreIndex<Key extends StoreName> = IndexNames<EmifitSchema, Key>;

type StoreQuery<
    Key extends StoreName,
    Index extends IndexNames<EmifitSchema, Key> = undefined
> = Index extends undefined ? StoreKey<EmifitSchema, Key> | IDBKeyRange | null : IndexKey<EmifitSchema, Key, Index>;

export type StoreQueryParams<
    Key extends StoreName,
    Index extends IndexNames<EmifitSchema, Key> = IndexNames<EmifitSchema, Key>
> = {
    index?: Index;
    query?: StoreQuery<Key, Index>;
    count?: number;
};

// const makeParams = <Index extends StoreIndex<"exercise">>(params: StoreQueryParams<"exercise", Index>) => params;
// makeParams({index: "by-category",query})

const makeStore = <Key extends StoreName, StoreEntity extends Entity = EmifitSchema[Key]["value"]>(name: Key) => {
    return {
        name,
        tx: (mode?: IDBTransactionMode, options?: IDBTransactionOptions) => db.transaction(name, mode, options),
        find: (id: StoreEntity["id"]) => db.get(name, id) as Promise<StoreEntity>,
        get: <Index extends StoreIndex<Key> = undefined>(params: StoreQueryParams<Key, Index> = {}) =>
            params.index
                ? db.getAllFromIndex(name, params.index, params.query as any, params.count)
                : db.getAll(name, params.query as string, params.count),
        keys: <Index extends StoreIndex<Key> = undefined>(params: StoreQueryParams<Key, Index> = {}) =>
            params.index
                ? db.getAllKeysFromIndex(name, params.index, params.query as any, params.count)
                : db.getAllKeys(name, params.query as string, params.count),
        count: <Index extends StoreIndex<Key> = undefined>(params: StoreQueryParams<Key, Index> = {}) =>
            params.index
                ? db.countFromIndex(name, params.index, params.query as any)
                : db.count(name, params.query as string),
        add: (value: StoreEntity) => db.add(name, value),
        put: (value: StoreEntity) => db.put(name, value),
        upsert: async (key: string, setterOrUpdate: Partial<StoreEntity> | ((current: StoreEntity) => StoreEntity)) => {
            const tx = db.transaction(name, "readwrite");
            const current = (await tx.store.get(key)) as StoreEntity;
            const update =
                typeof setterOrUpdate === "function" ? setterOrUpdate(current) : { ...current, ...setterOrUpdate };
            await tx.store.put(update);
            return tx.done;
        },
        delete: (id: StoreEntity["id"]) => db.delete(name, id),
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
    exercise: makeStore("exercise"),
    program: makeStore("program"),
    daily: makeStore("daily"),
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
