import { createStore, del, entries, get, keys, update, UseStore, values } from "idb-keyval";
import { DailyWithReferences, ExerciseWithReferences, ProgramWithReferences } from "./orm-types";

interface Entity {
    id: string;
}

const makeListCrud = <T extends Entity = Entity, Key extends string = string>(key: Key) => {
    const createFn = (value: T) => update<T[]>(key, (current) => [...(current || []), value]);
    const updateFn = (value: T) =>
        update<T[]>(key, (current) => (current || []).map((v) => (v.id === value.id ? value : v)));

    return {
        type: "list" as const,
        key,
        get: async () => (await get<T[]>(key)) || [],
        find: async (id: Entity["id"]) => (await get<T[]>(key)).find((v) => v.id === id),
        create: createFn,
        createMany: (values: T[]) => update<T[]>(key, (current) => [...(current || []), ...values]),
        update: updateFn,
        upsert: (value: T) => (value.id ? updateFn(value) : createFn(value)),
        remove: (id: Entity["id"]) => update<T[]>(key, (current) => (current || []).filter((v) => v.id !== id)),
        // createMany
        // updateMany
    };
};

const makeDynamicCrud = <T extends Entity = Entity>(store: UseStore) => {
    return {
        type: "dynamic" as const,
        get: (key: string) => get<T>(key, store),
        keys: () => keys(store),
        values: () => values<T>(store),
        entries: () => entries<string, T>(store),
        create: (key: string, value: T) => update<T>(key, () => value, store),
        upsert: (key: string, setterOrUpdate: Partial<T> | ((current: T) => T)) =>
            update<T>(
                key,
                typeof setterOrUpdate === "function"
                    ? setterOrUpdate
                    : (current) => ({ ...current, ...setterOrUpdate }),
                store
            ),
        remove: (key: string) => del(key, store),
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

const dailyStore = createStore("emifit", "daily");

export const orm = {
    exercise: makeListCrud<ExerciseWithReferences, "exerciseList">("exerciseList"),
    program: makeListCrud<ProgramWithReferences, "programList">("programList"),
    programListOrder: makeKeyValue<string[], "programListOrder">("programListOrder"),
    daily: makeDynamicCrud<DailyWithReferences>(dailyStore),
};
